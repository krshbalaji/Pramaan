import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PeriodSelect } from "@/components/gst/period-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentGstPeriod, formatGstPeriod, inr } from "@/lib/gst/engine";
import { getGstr1, lockReturn } from "@/lib/gst/server";
import { useActiveCompanyId } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/returns/gstr-1")({ component: Gstr1Page });

function Gstr1Page() {
  const companyId = useActiveCompanyId();
  const [period, setPeriod] = useState(currentGstPeriod());
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["gstr1", companyId, period],
    queryFn: () => getGstr1({ data: { companyId: companyId!, period } }),
    enabled: companyId != null,
  });
  const file = useMutation({
    mutationFn: () => lockReturn({ data: { companyId: companyId!, period, which: "gstr1" } }),
    onSuccess: () => {
      toast.success("GSTR-1 marked filed. JSON is ready for GST portal upload.");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const data = q.data;

  function downloadJson() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data.json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_${data.json.gstin}_${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Outward supplies</p>
          <h1 className="mt-1 font-display text-3xl">GSTR-1</h1>
        </div>
        {data ? <Badge tone={data.locked ? "success" : "warn"}>{data.gstr1Status}</Badge> : null}
      </div>

      <Card className="flex flex-wrap items-end justify-between gap-3">
        <PeriodSelect value={period} onChange={setPeriod} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={downloadJson} disabled={!data}>
            Download JSON
          </Button>
          <Button type="button" onClick={() => file.mutate()} disabled={!data || data.locked || file.isPending}>
            Mark filed
          </Button>
        </div>
      </Card>

      {!data ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />
      ) : (
        <>
          <p className="text-sm text-fg-muted">
            Draft for {formatGstPeriod(period)}. Issued invoices auto-populate B2B / B2C. E-invoice IRNs travel with
            the JSON so you can upload on GSTN — this app does not push to the live portal.
          </p>
          <Section title="B2B (registered)" rows={data.b2b} empty="No B2B invoices this period." />
          <Section title="B2B reverse charge" rows={data.b2bRcm} empty="No reverse-charge invoices." />
          <Section title="B2C (unregistered)" rows={data.b2c} empty="No B2C invoices this period." />
          <Section title="Credit / debit notes" rows={data.cdnr} empty="No notes this period." />

          <Card className="overflow-x-auto p-0">
            <div className="px-4 py-3">
              <h2 className="font-display text-xl">HSN / SAC summary</h2>
            </div>
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-y border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
                <tr>
                  <th className="px-4 py-3">HSN / SAC</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Taxable</th>
                </tr>
              </thead>
              <tbody>
                {data.hsn.map((h) => (
                  <tr key={h.hsn} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono">{h.hsn}</td>
                    <td className="px-4 py-3 text-right font-mono">{h.qty}</td>
                    <td className="px-4 py-3 text-right font-mono">₹ {inr(h.taxable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.hsn.length === 0 ? <p className="p-6 text-sm text-fg-muted">No HSN lines this period.</p> : null}
          </Card>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  rows,
  empty,
}: {
  title: string;
  empty: string;
  rows: {
    id: number;
    number: string;
    issueDate: string;
    taxable: number;
    igst: number;
    cgst: number;
    sgst: number;
    total: number;
    customer?: { name: string; gstin: string } | null;
  }[];
}) {
  return (
    <Card className="overflow-x-auto p-0">
      <div className="px-4 py-3">
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-y border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
          <tr>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Party</th>
            <th className="px-4 py-3">GSTIN</th>
            <th className="px-4 py-3 text-right">Taxable</th>
            <th className="px-4 py-3 text-right">IGST</th>
            <th className="px-4 py-3 text-right">CGST</th>
            <th className="px-4 py-3 text-right">SGST</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium">
                {r.number}
                <div className="text-xs text-fg-subtle">{r.issueDate}</div>
              </td>
              <td className="px-4 py-3">{r.customer?.name || "—"}</td>
              <td className="px-4 py-3 font-mono text-xs">{r.customer?.gstin || "—"}</td>
              <td className="px-4 py-3 text-right font-mono">{inr(r.taxable)}</td>
              <td className="px-4 py-3 text-right font-mono">{inr(r.igst)}</td>
              <td className="px-4 py-3 text-right font-mono">{inr(r.cgst)}</td>
              <td className="px-4 py-3 text-right font-mono">{inr(r.sgst)}</td>
              <td className="px-4 py-3 text-right font-mono">₹ {inr(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="p-6 text-sm text-fg-muted">{empty}</p> : null}
    </Card>
  );
}
