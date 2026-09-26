import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inr } from "@/lib/gst/engine";
import { qrSvg } from "@/lib/gst/irn";
import { cancelEinvoice, generateEinvoice, listInvoices } from "@/lib/gst/server";
import { useActiveCompanyId, useWorkspace } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/einvoice")({ component: EinvoicePage });

function EinvoicePage() {
  const companyId = useActiveCompanyId();
  const ws = useWorkspace();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["invoices", companyId],
    queryFn: () => listInvoices({ data: companyId! }),
    enabled: companyId != null,
  });
  const generate = useMutation({
    mutationFn: (id: number) => generateEinvoice({ data: id }),
    onSuccess: () => {
      toast.success("Sandbox IRN generated");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancel = useMutation({
    mutationFn: (id: number) => cancelEinvoice({ data: id }),
    onSuccess: () => {
      toast.success("IRN cancelled (24h window)");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (q.data ?? []).filter((inv) => inv.status === "issued");
  const queue = rows.filter((inv) => inv.einvoiceStatus === "pending" || inv.einvoiceStatus === "failed");
  const generated = rows.filter((inv) => inv.einvoiceStatus === "generated");
  const aato = ws.data?.company.aato ?? 0;
  const required = aato >= 5_00_00_000;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">IRP sandbox</p>
          <h1 className="mt-1 font-display text-3xl">E-Invoice</h1>
        </div>
        <Badge tone={required ? "warn" : "success"}>{required ? "IRN mandatory on B2B" : "Below ₹5 Cr AATO"}</Badge>
      </div>

      <Card>
        <p className="text-sm text-fg-muted">
          Pramaan issues a sandbox IRN and QR for demo and GSTR-1 auto-population. It does not call NIC / IRP.
          Cancel is allowed only within 24 hours. Taxpayers with AATO of ₹10 crore or more must report within 30 days
          of invoice date.
        </p>
        <p className="mt-2 font-mono text-sm">
          AATO ₹ {inr(aato)} · GSTIN {ws.data?.gstins[0]?.gstin ?? "—"}
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Awaiting IRN" value={String(queue.length)} warn={queue.length > 0} />
        <Stat label="Generated" value={String(generated.length)} />
        <Stat label="Issued B2B docs" value={String(rows.length)} />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3">IRN</th>
              <th className="px-4 py-3 no-print">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3">
                  <Link to="/invoices/$id" params={{ id: String(inv.id) }} className="font-medium text-accent">
                    {inv.number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>{inv.customerName}</div>
                  <div className="font-mono text-[11px] text-fg-subtle">{inv.customerGstin || "Unregistered"}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{inv.issueDate}</td>
                <td className="px-4 py-3 text-right font-mono">₹ {inr(inv.total)}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      inv.einvoiceStatus === "generated"
                        ? "success"
                        : inv.einvoiceStatus === "failed"
                          ? "danger"
                          : inv.einvoiceStatus === "cancelled"
                            ? "warn"
                            : "neutral"
                    }
                  >
                    {inv.einvoiceStatus}
                  </Badge>
                  {inv.irn ? (
                    <div className="mt-2 flex items-start gap-2">
                      <div dangerouslySetInnerHTML={{ __html: qrSvg(inv.irn, 56) }} />
                      <p className="break-all font-mono text-[10px] text-fg-subtle">{inv.irn}</p>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {inv.einvoiceStatus === "pending" || inv.einvoiceStatus === "failed" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="accent"
                      disabled={generate.isPending || !inv.customerGstin}
                      onClick={() => generate.mutate(inv.id)}
                    >
                      Generate IRN
                    </Button>
                  ) : null}
                  {inv.einvoiceStatus === "generated" ? (
                    <Button type="button" size="sm" variant="outline" disabled={cancel.isPending} onClick={() => cancel.mutate(inv.id)}>
                      Cancel IRN
                    </Button>
                  ) : null}
                  {!inv.customerGstin ? <p className="text-xs text-fg-subtle">B2C — IRN not required</p> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="p-6 text-sm text-fg-muted">Issue a B2B invoice to see it on the IRN queue.</p> : null}
      </Card>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className={`mt-2 font-display text-2xl ${warn ? "text-danger" : ""}`}>{value}</p>
    </Card>
  );
}
