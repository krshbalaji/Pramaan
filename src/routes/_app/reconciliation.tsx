import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { inr } from "@/lib/gst/engine";
import { getReconciliation } from "@/lib/gst/server";
import { useActiveCompanyId } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/reconciliation")({ component: ReconPage });

function ReconPage() {
  const companyId = useActiveCompanyId();
  const q = useQuery({
    queryKey: ["recon", companyId],
    queryFn: () => getReconciliation({ data: companyId! }),
    enabled: companyId != null,
  });
  if (!q.data) return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;

  const irn = q.data.gstr1VsIrn;
  const itc = q.data.itc;
  const irnIssues = irn.filter((r) => r.bucket !== "matched");
  const itcIssues = itc.filter((r) => r.bucket !== "matched");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Exceptions</p>
        <h1 className="mt-1 font-display text-3xl">Reconciliation</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-fg-subtle">GSTR-1 vs IRN</p>
          <p className="mt-2 font-display text-3xl">{irnIssues.length}</p>
          <p className="text-sm text-fg-muted">Issued invoices missing or failed IRN</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-fg-subtle">Books vs GSTR-2B</p>
          <p className="mt-2 font-display text-3xl">{itcIssues.length}</p>
          <p className="text-sm text-fg-muted">Purchases in books but not in 2B</p>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="px-4 py-3">
          <h2 className="font-display text-xl">Sales vs e-invoice</h2>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-y border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">IRN status</th>
              <th className="px-4 py-3">Bucket</th>
            </tr>
          </thead>
          <tbody>
            {irn.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link to="/invoices/$id" params={{ id: String(r.id) }} className="font-medium text-accent">
                    {r.number}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.customer}</td>
                <td className="px-4 py-3 text-right font-mono">₹ {inr(r.total)}</td>
                <td className="px-4 py-3">
                  <Badge tone={tone(r.bucket)}>{r.einvoiceStatus}</Badge>
                </td>
                <td className="px-4 py-3 text-xs uppercase tracking-wide text-fg-muted">{label(r.bucket)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-x-auto p-0">
        <div className="px-4 py-3">
          <h2 className="font-display text-xl">Purchase ITC vs 2B</h2>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-y border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Bill</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3 text-right">Tax</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">2B</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {itc.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{r.number}</td>
                <td className="px-4 py-3">{r.vendor}</td>
                <td className="px-4 py-3 text-right font-mono">₹ {inr(r.tax)}</td>
                <td className="px-4 py-3 text-right font-mono">₹ {inr(r.total)}</td>
                <td className="px-4 py-3">
                  <Badge tone={r.inGstr2b ? "success" : "danger"}>{r.inGstr2b ? "In 2B" : "Missing 2B"}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-fg-muted">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function tone(bucket: string): "success" | "warn" | "danger" | "neutral" {
  if (bucket === "matched") return "success";
  if (bucket === "failed_irn" || bucket === "missing_irn") return "danger";
  if (bucket === "cancelled_irn") return "warn";
  return "neutral";
}

function label(bucket: string) {
  if (bucket === "matched") return "Matched";
  if (bucket === "missing_irn") return "Missing IRN";
  if (bucket === "failed_irn") return "IRP failed";
  if (bucket === "cancelled_irn") return "IRN cancelled";
  return bucket;
}
