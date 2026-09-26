import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/gst/server";
import { useActiveCompanyId } from "@/lib/gst/use-workspace";
import { inr } from "@/lib/gst/engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/")({ component: Dashboard });

function Dashboard() {
  const companyId = useActiveCompanyId();
  const q = useQuery({
    queryKey: ["dashboard", companyId],
    queryFn: () => getDashboard({ data: companyId! }),
    enabled: companyId != null,
  });
  if (!q.data) {
    return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;
  }
  const d = q.data;
  const aatoCr = d.workspace.company.aato / 1_00_00_000;
  const eInvDue = d.workspace.company.aato >= 5_00_00_000;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">September 2026</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Ledger home</h1>
        </div>
        <Button asChild>
          <Link to="/invoices/new">New invoice</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Issued this month" value={`₹ ${inr(d.monthSales)}`} />
        <Stat label="GST on books" value={`₹ ${inr(d.tax)}`} />
        <Stat label="ITC in 2B" value={`₹ ${inr(d.itc)}`} />
        <Stat label="Pending IRN" value={String(d.pendingIrn + d.failedIrn)} warn={d.failedIrn > 0} />
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-fg-subtle">AATO tracker</p>
          <p className="mt-1 font-display text-2xl">₹ {inr(d.workspace.company.aato)}</p>
          <p className="mt-1 text-sm text-fg-muted">
            {aatoCr.toFixed(2)} crore PAN-level. E-invoicing threshold is ₹5 crore.
          </p>
        </div>
        <Badge tone={eInvDue ? "warn" : "success"}>{eInvDue ? "IRN mandatory on B2B" : "Below IRN threshold"}</Badge>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl">Recent documents</h2>
            <Link to="/invoices" className="text-sm text-accent">
              All invoices
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {d.recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link to="/invoices/$id" params={{ id: String(r.id) }} className="font-medium">
                    {r.number}
                  </Link>
                  <p className="truncate text-xs text-fg-muted">
                    {r.customerName} · {r.issueDate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">₹ {inr(r.total)}</div>
                  <Status status={r.status} ei={r.einvoiceStatus} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl">Compliance calendar</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex justify-between border-b border-border pb-2">
              <span>GSTR-1 (Sep)</span>
              <span className="text-fg-muted">11 Oct</span>
            </li>
            <li className="flex justify-between border-b border-border pb-2">
              <span>GSTR-3B (Sep)</span>
              <span className="text-fg-muted">20 Oct</span>
            </li>
            <li className="flex justify-between">
              <span>Drafts waiting</span>
              <span className="font-mono">{d.drafts}</span>
            </li>
          </ul>
          <div className="mt-6 space-y-2 text-xs text-fg-muted">
            {d.audit.map((a, i) => (
              <p key={i}>
                {a.action} · {a.entity} {a.entityId}
              </p>
            ))}
          </div>
        </Card>
      </div>
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

function Status({ status, ei }: { status: string; ei: string }) {
  const tone = status === "issued" ? "success" : status === "cancelled" ? "danger" : "warn";
  return (
    <div className="mt-1 flex justify-end gap-1">
      <Badge tone={tone}>{status}</Badge>
      {ei === "failed" ? <Badge tone="danger">IRN</Badge> : null}
    </div>
  );
}
