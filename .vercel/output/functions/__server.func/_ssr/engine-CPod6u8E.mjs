import { o as findPreset, t as COMPOSITION_RATES } from "./catalog-C2pOHWsL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine-CPod6u8E.js
function roundMoney(n) {
	return Math.round((n + Number.EPSILON) * 100) / 100;
}
function num(v) {
	if (typeof v === "number") return Number.isFinite(v) ? v : 0;
	if (typeof v === "string") return Number.parseFloat(v) || 0;
	return 0;
}
/** Preset total rate (18% Inter and 18% Intra both yield 0.18). Not rounded — 5% halves are 0.025. */
function presetRate(presetName) {
	const preset = findPreset(presetName);
	return Math.max(preset.igst, preset.cgst + preset.sgst);
}
function computeTax(opts) {
	const preset = findPreset(opts.presetName);
	const taxable = roundMoney(opts.taxable);
	const inter = (opts.supplierState || "") !== (opts.recipientState || "");
	const supplyType = inter ? "Inter-State" : "Intra-State";
	if (preset.scheme === "COMPOSITION") return {
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
		compositionTax: roundMoney(taxable * (COMPOSITION_RATES[preset.name] ?? .06)),
		docTitle: "Bill of Supply"
	};
	const rate = presetRate(opts.presetName);
	if (inter) {
		const igst = roundMoney(taxable * rate);
		return {
			scheme: "REGULAR",
			supplyType,
			cgstRate: 0,
			sgstRate: 0,
			igstRate: rate,
			cgst: 0,
			sgst: 0,
			igst,
			totalTax: igst,
			taxable,
			grandTotal: roundMoney(taxable + igst),
			compositionTax: 0,
			docTitle: "Tax Invoice"
		};
	}
	const half = rate / 2;
	const cgst = roundMoney(taxable * half);
	const sgst = roundMoney(taxable * half);
	const totalTax = roundMoney(cgst + sgst);
	return {
		scheme: "REGULAR",
		supplyType,
		cgstRate: half,
		sgstRate: half,
		igstRate: 0,
		cgst,
		sgst,
		igst: 0,
		totalTax,
		taxable,
		grandTotal: roundMoney(taxable + totalTax),
		compositionTax: 0,
		docTitle: "Tax Invoice"
	};
}
function inr(n) {
	return n.toLocaleString("en-IN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
var ONES = [
	"",
	"One",
	"Two",
	"Three",
	"Four",
	"Five",
	"Six",
	"Seven",
	"Eight",
	"Nine",
	"Ten",
	"Eleven",
	"Twelve",
	"Thirteen",
	"Fourteen",
	"Fifteen",
	"Sixteen",
	"Seventeen",
	"Eighteen",
	"Nineteen"
];
var TENS = [
	"",
	"",
	"Twenty",
	"Thirty",
	"Forty",
	"Fifty",
	"Sixty",
	"Seventy",
	"Eighty",
	"Ninety"
];
function chunkToWords(n) {
	if (n < 20) return ONES[n];
	if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`.trim();
	return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? " " + chunkToWords(n % 100) : ""}`;
}
function amountInWords(value) {
	const rupees = Math.floor(Math.abs(roundMoney(value)));
	if (rupees === 0) return "Indian Rupees Zero Only";
	const crore = Math.floor(rupees / 1e7);
	const lakh = Math.floor(rupees % 1e7 / 1e5);
	const thousand = Math.floor(rupees % 1e5 / 1e3);
	const rest = rupees % 1e3;
	const parts = [];
	if (crore) parts.push(`${chunkToWords(crore)} Crore`);
	if (lakh) parts.push(`${chunkToWords(lakh)} Lakh`);
	if (thousand) parts.push(`${chunkToWords(thousand)} Thousand`);
	if (rest) parts.push(chunkToWords(rest));
	return `Indian Rupees ${parts.join(" ")} Only`;
}
function fyFromDate(iso) {
	const d = new Date(iso);
	const y = d.getFullYear();
	return d.getMonth() + 1 >= 4 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
}
function einvoiceRequired(aato, scheme, hasCustomerGstin, docType) {
	return aato >= 5e7 && scheme === "REGULAR" && hasCustomerGstin && (docType === "tax_invoice" || docType === "credit_note" || docType === "debit_note");
}
function withinReportingWindow(aato, issueDate) {
	if (aato < 1e8) return true;
	const issued = new Date(issueDate).getTime();
	return Date.now() - issued <= 2592e6;
}
function currentGstPeriod(d = /* @__PURE__ */ new Date()) {
	return `${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
}
function formatGstPeriod(period) {
	const mm = Number(period.slice(0, 2));
	const yyyy = Number(period.slice(2));
	if (!mm || !yyyy) return period;
	return new Date(yyyy, mm - 1, 1).toLocaleString("en-IN", {
		month: "long",
		year: "numeric"
	});
}
function gstPeriodOptions(count = 12) {
	const now = /* @__PURE__ */ new Date();
	return Array.from({ length: count }, (_, i) => {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		return {
			value: currentGstPeriod(d),
			label: d.toLocaleString("en-IN", {
				month: "long",
				year: "numeric"
			})
		};
	});
}
//#endregion
export { formatGstPeriod as a, inr as c, withinReportingWindow as d, einvoiceRequired as i, num as l, computeTax as n, fyFromDate as o, currentGstPeriod as r, gstPeriodOptions as s, amountInWords as t, roundMoney as u };
