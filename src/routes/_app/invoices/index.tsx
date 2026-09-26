import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listInvoices } from "@/lib/gst/server";
import { useActiveCompanyId } from "@/lib/gst/use-workspace";
import { inr } from "@/lib/gst/engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/invoices/")({ component: InvoicesPage });

function InvoicesPage() {
  const companyId = useActiveCompanyId();
  const q = useQuery({
    queryKey: ["invoices", companyId],
    queryFn: () => listInvoices({ data: companyId! }),
    enabled: companyId != null,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Sales register</p>
          <h1 className="mt-1 font-display text-3xl">Invoices</h1>
        </div>
        <Button asChild>
          <Link to="/invoices/new">New invoice</Link>
        </Button>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link to="/invoices/$id" params={{ id: String(inv.id) }} className="font-medium text-accent">
                    {inv.number || "Draft"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>{inv.customerName}</div>
                  <div className="font-mono text-[11px] text-fg-subtle">{inv.customerGstin}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{inv.issueDate}</td>
                <td className="px-4 py-3 text-right font-mono">₹ {inr(inv.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={inv.status === "issued" ? "success" : inv.status === "cancelled" ? "danger" : "warn"}>{inv.status}</Badge>
                    <Badge tone={inv.einvoiceStatus === "generated" ? "success" : inv.einvoiceStatus === "failed" ? "danger" : "neutral"}>
                      {inv.einvoiceStatus}
                    </Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.length === 0 ? <p className="p-6 text-sm text-fg-muted">No invoices yet.</p> : null}
      </Card>
    </div>
  );
}
