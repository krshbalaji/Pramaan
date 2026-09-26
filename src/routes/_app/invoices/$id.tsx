import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InvoiceForm } from "@/components/gst/invoice-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { amountInWords, inr } from "@/lib/gst/engine";
import { qrSvg } from "@/lib/gst/irn";
import { cancelEinvoice, generateEinvoice, getInvoice, issueInvoice } from "@/lib/gst/server";
import { useWorkspace } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/invoices/$id")({ component: InvoiceDetail });

function InvoiceDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const ws = useWorkspace();
  const q = useQuery({ queryKey: ["invoice", id], queryFn: () => getInvoice({ data: Number(id) }) });
  const issue = useMutation({
    mutationFn: () => issueInvoice({ data: Number(id) }),
    onSuccess: () => {
      toast.success("Invoice issued");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const irn = useMutation({
    mutationFn: () => generateEinvoice({ data: Number(id) }),
    onSuccess: () => {
      toast.success("Sandbox IRN generated");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancel = useMutation({
    mutationFn: () => cancelEinvoice({ data: Number(id) }),
    onSuccess: () => {
      toast.success("IRN cancelled");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const inv = q.data;
  if (!inv || !ws.data) return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;

  if (inv.status === "draft") {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Draft</p>
            <h1 className="mt-1 font-display text-3xl">Edit invoice</h1>
          </div>
          <Button type="button" onClick={() => issue.mutate()} disabled={issue.isPending}>
            Issue & number
          </Button>
        </div>
        <InvoiceForm workspace={ws.data} invoice={inv} />
      </div>
    );
  }

  const company = ws.data.company;
  const gstin = ws.data.gstins.find((g) => g.id === inv.gstinId);
  const qr = inv.irn ? qrSvg(inv.qrPayload || inv.irn, 112) : "";

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/invoices" className="text-sm text-accent">
            ← All invoices
          </Link>
          <h1 className="mt-1 font-display text-3xl">{inv.number}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {inv.einvoiceStatus === "pending" || inv.einvoiceStatus === "failed" ? (
            <Button type="button" variant="accent" onClick={() => irn.mutate()} disabled={irn.isPending}>
              Generate sandbox IRN
            </Button>
          ) : null}
          {inv.einvoiceStatus === "generated" ? (
            <Button type="button" variant="outline" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
              Cancel IRN
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => window.print()}>
            Print / PDF
          </Button>
        </div>
      </div>

      <Card className="space-y-6 print:border-0 print:shadow-none">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-fg-subtle">Supplier</p>
            <h2 className="font-display text-2xl">{company.legalName}</h2>
            <p className="text-sm text-fg-muted">{company.tradeName}</p>
            <p className="mt-2 font-mono text-sm">GSTIN {gstin?.gstin}</p>
            <p className="text-sm text-fg-muted">
              {company.address1}
              <br />
              {company.city}, {company.stateName}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl">{inv.scheme === "COMPOSITION" ? "Bill of Supply" : "Tax Invoice"}</p>
            <p className="mt-2 font-mono">{inv.number}</p>
            <p className="text-sm text-fg-muted">Date {inv.issueDate}</p>
            <div className="mt-2 flex justify-end gap-1">
              <Badge tone="success">{inv.status}</Badge>
              <Badge>{inv.einvoiceStatus}</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-fg-subtle">Bill to</p>
            <p className="font-medium">{inv.customer?.name ?? "Unregistered"}</p>
            {inv.customer?.gstin ? <p className="font-mono text-sm">GSTIN {inv.customer.gstin}</p> : null}
            <p className="text-sm text-fg-muted">
              {inv.customer?.address1} {inv.customer?.city}
            </p>
          </div>
          <div className="text-sm">
            <p>Place of supply: {inv.placeOfSupplyCode}-{inv.placeOfSupplyName}</p>
            <p>Supply type: {inv.supplyType}</p>
            <p>Preset: {inv.gstPreset}</p>
            <p>Reverse charge: {inv.reverseCharge ? "Yes" : "No"}</p>
            {inv.irn ? <p className="mt-2 break-all font-mono text-[11px]">IRN {inv.irn}</p> : null}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-y border-border text-left text-xs uppercase text-fg-subtle">
            <tr>
              <th className="py-2">Description</th>
              <th>SAC</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.lines.map((l) => (
              <tr key={l.id} className="border-b border-border">
                <td className="py-2">{l.description}</td>
                <td className="font-mono">{l.hsnSac}</td>
                <td className="text-right">
                  {l.qty} {l.unit}
                </td>
                <td className="text-right font-mono">{inr(l.rate)}</td>
                <td className="text-right font-mono">{inr(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-md text-sm text-fg-muted">{amountInWords(inv.total)}</p>
          <dl className="min-w-48 space-y-1 font-mono text-sm">
            <div className="flex justify-between">
              <span>Taxable</span>
              <span>₹ {inr(inv.taxable)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST</span>
              <span>₹ {inr(inv.cgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST</span>
              <span>₹ {inr(inv.sgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST</span>
              <span>₹ {inr(inv.igst)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span>₹ {inr(inv.total)}</span>
            </div>
          </dl>
        </div>

        {qr ? <div className="flex items-center gap-3" dangerouslySetInnerHTML={{ __html: qr }} /> : null}
        <p className="text-xs text-fg-subtle">{inv.notes}</p>
        <p className="text-xs text-fg-subtle">
          Bank {company.bankName} · {company.ifsc} · UPI {company.upi}
        </p>
      </Card>
    </div>
  );
}
