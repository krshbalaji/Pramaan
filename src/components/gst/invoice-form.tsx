import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CUSTOM_PRODUCT_CODE, GST_PRESETS, UNITS } from "@/lib/gst/catalog";
import { computeTax, inr, roundMoney } from "@/lib/gst/engine";
import { saveInvoice } from "@/lib/gst/server";
import type { Invoice, Workspace } from "@/lib/gst/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type LineDraft = {
  productId: number | null;
  description: string;
  hsnSac: string;
  qty: number;
  unit: string;
  rate: number;
  isCustom: boolean;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function InvoiceForm({ workspace, invoice }: { workspace: Workspace; invoice?: Invoice }) {
  const nav = useNavigate();
  const customers = workspace.parties.filter((p) => p.kind === "customer");
  const catalog = workspace.products.filter((p) => p.active);
  const defaultProduct = catalog.find((p) => p.code !== CUSTOM_PRODUCT_CODE) ?? catalog[0];
  const [customerId, setCustomerId] = useState<number | null>(invoice?.customerId ?? customers[0]?.id ?? null);
  const [gstinId, setGstinId] = useState(invoice?.gstinId ?? workspace.gstins[0]?.id);
  const [docType, setDocType] = useState(invoice?.docType ?? "tax_invoice");
  const [issueDate, setIssueDate] = useState(invoice?.issueDate || today());
  const [dueDate, setDueDate] = useState(invoice?.dueDate || plusDays(today(), 30));
  const [poNumber, setPoNumber] = useState(invoice?.poNumber ?? "PO-88421-A");
  const [reverseCharge, setReverseCharge] = useState(invoice?.reverseCharge ?? false);
  const [gstPreset, setGstPreset] = useState(invoice?.gstPreset || workspace.company.gstPreset);
  const [notes, setNotes] = useState(invoice?.notes ?? "Net 30. Quote invoice number on remittance.");
  const [lines, setLines] = useState<LineDraft[]>(
    invoice?.lines.length
      ? invoice.lines.map((l) => ({
          productId: l.productId,
          description: l.description,
          hsnSac: l.hsnSac,
          qty: l.qty,
          unit: l.unit,
          rate: l.rate,
          isCustom: l.isCustom,
        }))
      : [
          {
            productId: defaultProduct?.id ?? null,
            description: defaultProduct?.description ?? "",
            hsnSac: defaultProduct?.hsnSac ?? "",
            qty: 1,
            unit: defaultProduct?.unit ?? "Nos",
            rate: defaultProduct?.rate ?? 0,
            isCustom: defaultProduct?.code === CUSTOM_PRODUCT_CODE,
          },
        ],
  );
  const [busy, setBusy] = useState(false);

  const customer = customers.find((c) => c.id === customerId);
  const gstin = workspace.gstins.find((g) => g.id === gstinId);
  const taxable = roundMoney(lines.reduce((s, l) => s + roundMoney(l.qty * l.rate), 0));
  const tax = useMemo(
    () =>
      computeTax({
        presetName: gstPreset,
        supplierState: gstin?.stateCode ?? workspace.company.stateCode,
        recipientState: customer?.stateCode || gstin?.stateCode || workspace.company.stateCode,
        taxable,
      }),
    [gstPreset, gstin?.stateCode, customer?.stateCode, taxable, workspace.company.stateCode],
  );

  function pickProduct(index: number, productId: number) {
    const p = catalog.find((x) => x.id === productId);
    if (!p) return;
    const custom = p.code === CUSTOM_PRODUCT_CODE;
    setLines((prev) =>
      prev.map((l, i) =>
        i === index
          ? {
              productId: p.id,
              description: custom ? "" : p.description,
              hsnSac: custom ? l.hsnSac : p.hsnSac,
              qty: l.qty || 1,
              unit: custom ? l.unit : p.unit,
              rate: custom ? l.rate : p.rate,
              isCustom: custom,
            }
          : l,
      ),
    );
  }

  async function onSave() {
    if (!gstinId) {
      toast.error("Select a GSTIN");
      return;
    }
    setBusy(true);
    try {
      const saved = await saveInvoice({
        data: {
          id: invoice?.id,
          companyId: workspace.company.id,
          gstinId,
          customerId,
          docType,
          issueDate,
          dueDate,
          poNumber,
          reverseCharge,
          gstPreset,
          notes,
          lines: lines.filter((l) => l.description && l.qty > 0),
        },
      });
      toast.success("Draft saved");
      nav({ to: "/invoices/$id", params: { id: String(saved?.id) } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="grid gap-4 md:grid-cols-2">
        <Field label="Customer">
          <Select value={customerId ?? ""} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Unregistered / B2C</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Issuing GSTIN">
          <Select value={gstinId} onChange={(e) => setGstinId(Number(e.target.value))}>
            {workspace.gstins.map((g) => (
              <option key={g.id} value={g.id}>
                {g.gstin} · {g.stateName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Document type">
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="tax_invoice">Tax invoice</option>
            <option value="bill_of_supply">Bill of supply</option>
            <option value="credit_note">Credit note</option>
            <option value="debit_note">Debit note</option>
          </Select>
        </Field>
        <Field label="GST rate preset">
          <Select value={gstPreset} onChange={(e) => setGstPreset(e.target.value)}>
            {GST_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Invoice date">
          <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </Field>
        <Field label="Due date">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="PO / reference">
          <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
        </Field>
        <Field label="Reverse charge">
          <Select value={reverseCharge ? "yes" : "no"} onChange={(e) => setReverseCharge(e.target.value === "yes")}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </Field>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl">Line items</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setLines((p) => [
                ...p,
                {
                  productId: defaultProduct?.id ?? null,
                  description: defaultProduct?.description ?? "",
                  hsnSac: defaultProduct?.hsnSac ?? "",
                  qty: 1,
                  unit: defaultProduct?.unit ?? "Nos",
                  rate: defaultProduct?.rate ?? 0,
                  isCustom: defaultProduct?.code === CUSTOM_PRODUCT_CODE,
                },
              ])
            }
          >
            Add line
          </Button>
        </div>
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="grid gap-2 rounded-[var(--radius-md)] border border-border p-3 md:grid-cols-12">
              <div className="md:col-span-4">
                <Label>Service / product</Label>
                <Select value={line.productId ?? ""} onChange={(e) => pickProduct(idx, Number(e.target.value))}>
                  {catalog.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.description}
                    </option>
                  ))}
                </Select>
                {line.isCustom ? (
                  <Input
                    className="mt-2"
                    placeholder="Custom description"
                    value={line.description}
                    onChange={(e) => setLines((p) => p.map((l, i) => (i === idx ? { ...l, description: e.target.value } : l)))}
                  />
                ) : null}
              </div>
              <div className="md:col-span-2">
                <Label>SAC / HSN</Label>
                <Input
                  className={line.isCustom ? "bg-input" : "bg-calc"}
                  readOnly={!line.isCustom}
                  value={line.hsnSac}
                  onChange={(e) => setLines((p) => p.map((l, i) => (i === idx ? { ...l, hsnSac: e.target.value } : l)))}
                />
              </div>
              <div className="md:col-span-1">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.qty}
                  onChange={(e) => setLines((p) => p.map((l, i) => (i === idx ? { ...l, qty: Number(e.target.value) } : l)))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Unit</Label>
                <Select
                  disabled={!line.isCustom}
                  className={line.isCustom ? "bg-input" : "bg-calc"}
                  value={line.unit}
                  onChange={(e) => setLines((p) => p.map((l, i) => (i === idx ? { ...l, unit: e.target.value } : l)))}
                >
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Rate</Label>
                <Input
                  type="number"
                  className={line.isCustom ? "bg-input" : "bg-calc"}
                  readOnly={!line.isCustom}
                  value={line.rate}
                  onChange={(e) => setLines((p) => p.map((l, i) => (i === idx ? { ...l, rate: Number(e.target.value) } : l)))}
                />
              </div>
              <div className="flex items-end justify-between md:col-span-1">
                <div>
                  <Label>Amt</Label>
                  <p className="font-mono text-sm">₹{inr(roundMoney(line.qty * line.rate))}</p>
                </div>
                {lines.length > 1 ? (
                  <button type="button" className="text-xs text-danger" onClick={() => setLines((p) => p.filter((_, i) => i !== idx))}>
                    Remove
                  </button>
                ) : null}
              </div>
              {line.isCustom ? <p className="md:col-span-12 text-xs text-warn">Custom mode — SAC, unit and rate are editable.</p> : null}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Label>Notes</Label>
          <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-fg-subtle">Tax summary</p>
          <p className="mt-1 text-sm text-fg-muted">
            {tax.docTitle} · {tax.supplyType} · Place of supply {customer?.stateCode || gstin?.stateCode}-{customer?.stateName || gstin?.stateName}
          </p>
          <dl className="mt-3 space-y-1 font-mono text-sm">
            <Row k="Taxable" v={tax.taxable} />
            <Row k={`CGST ${tax.cgstRate * 100}%`} v={tax.cgst} />
            <Row k={`SGST ${tax.sgstRate * 100}%`} v={tax.sgst} />
            <Row k={`IGST ${tax.igstRate * 100}%`} v={tax.igst} />
            {tax.compositionTax ? <Row k="Composition (info)" v={tax.compositionTax} /> : null}
            <Row k="Grand total" v={tax.grandTotal} strong />
          </dl>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 no-print">
        <Button type="button" disabled={busy} onClick={onSave}>
          {busy ? "Saving…" : "Save draft"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-border pt-2 font-medium" : ""}`}>
      <span>{k}</span>
      <span>₹ {inr(v)}</span>
    </div>
  );
}
