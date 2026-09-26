import { COMPOSITION_RATES, findPreset, type TaxScheme } from "./catalog";

export function roundMoney(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  return 0;
}

export type TaxResult = {
  scheme: TaxScheme;
  supplyType: "Inter-State" | "Intra-State";
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  taxable: number;
  grandTotal: number;
  compositionTax: number;
  docTitle: string;
};

export function computeTax(opts: {
  presetName: string;
  supplierState: string;
  recipientState: string;
  taxable: number;
}): TaxResult {
  const preset = findPreset(opts.presetName);
  const taxable = roundMoney(opts.taxable);
  const inter = (opts.supplierState || "") !== (opts.recipientState || "");
  const supplyType = inter ? "Inter-State" : "Intra-State";

  if (preset.scheme === "COMPOSITION") {
    const rate = COMPOSITION_RATES[preset.name] ?? 0.06;
    return {
      scheme: "COMPOSITION",
      supplyType,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0,
      taxable,
      grandTotal: taxable,
      compositionTax: roundMoney(taxable * rate),
      docTitle: "Bill of Supply",
    };
  }

  if (inter) {
    const igst = roundMoney(taxable * preset.igst);
    return {
      scheme: "REGULAR",
      supplyType,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: preset.igst,
      cgst: 0,
      sgst: 0,
      igst,
      totalTax: igst,
      taxable,
      grandTotal: roundMoney(taxable + igst),
      compositionTax: 0,
      docTitle: "Tax Invoice",
    };
  }

  const cgst = roundMoney(taxable * preset.cgst);
  const sgst = roundMoney(taxable * preset.sgst);
  const totalTax = roundMoney(cgst + sgst);
  return {
    scheme: "REGULAR",
    supplyType,
    cgstRate: preset.cgst,
    sgstRate: preset.sgst,
    igstRate: 0,
    cgst,
    sgst,
    igst: 0,
    totalTax,
    taxable,
    grandTotal: roundMoney(taxable + totalTax),
    compositionTax: 0,
    docTitle: "Tax Invoice",
  };
}

export function inr(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function chunkToWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`.trim();
  return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? " " + chunkToWords(n % 100) : ""}`;
}

export function amountInWords(value: number): string {
  const rupees = Math.floor(Math.abs(roundMoney(value)));
  if (rupees === 0) return "Indian Rupees Zero Only";
  const crore = Math.floor(rupees / 1_00_00_000);
  const lakh = Math.floor((rupees % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((rupees % 1_00_000) / 1000);
  const rest = rupees % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${chunkToWords(crore)} Crore`);
  if (lakh) parts.push(`${chunkToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${chunkToWords(thousand)} Thousand`);
  if (rest) parts.push(chunkToWords(rest));
  return `Indian Rupees ${parts.join(" ")} Only`;
}

export function periodFromDate(iso: string) {
  const d = iso.slice(0, 10);
  const [y, m] = d.split("-");
  return `${m}${y}`;
}

export function fyFromDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return m >= 4 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
}

export function einvoiceRequired(aato: number, scheme: TaxScheme, hasCustomerGstin: boolean, docType: string) {
  return (
    aato >= 5_00_00_000 &&
    scheme === "REGULAR" &&
    hasCustomerGstin &&
    (docType === "tax_invoice" || docType === "credit_note" || docType === "debit_note")
  );
}

export function withinReportingWindow(aato: number, issueDate: string) {
  if (aato < 10_00_00_000) return true;
  const issued = new Date(issueDate).getTime();
  const age = Date.now() - issued;
  return age <= 30 * 24 * 60 * 60 * 1000;
}

export function currentGstPeriod(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${mm}${d.getFullYear()}`;
}

export function formatGstPeriod(period: string) {
  const mm = Number(period.slice(0, 2));
  const yyyy = Number(period.slice(2));
  if (!mm || !yyyy) return period;
  return new Date(yyyy, mm - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

export function gstPeriodOptions(count = 12) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { value: currentGstPeriod(d), label: d.toLocaleString("en-IN", { month: "long", year: "numeric" }) };
  });
}
