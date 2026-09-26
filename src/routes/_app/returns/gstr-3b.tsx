import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PeriodSelect } from "@/components/gst/period-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentGstPeriod, formatGstPeriod, inr } from "@/lib/gst/engine";
import { getGstr3b, lockReturn } from "@/lib/gst/server";
import { useActiveCompanyId } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/returns/gstr-3b")({ component: Gstr3bPage });

function Gstr3bPage() {
  const companyId = useActiveCompanyId();
  const [period, setPeriod] = useState(currentGstPeriod());
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["gstr3b", companyId, period],
    queryFn: () => getGstr3b({ data: { companyId: companyId!, period } }),
    enabled: companyId != null,
  });
  const file = useMutation({
    mutationFn: () => lockReturn({ data: { companyId: companyId!, period, which: "gstr3b" } }),
    onSuccess: () => {
      toast.success("GSTR-3B marked filed (draft worksheet).");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const data = q.data;
  if (!data) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-3xl">GSTR-3B</h1>
        <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />
      </div>
    );
  }

  const net =
    data.payable.igst + data.payable.cgst + data.payable.sgst;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Summary return</p>
          <h1 className="mt-1 font-display text-3xl">GSTR-3B</h1>
        </div>
        <Badge tone={data.locked ? "success" : "warn"}>{data.locked ? "filed" : "draft"}</Badge>
      </div>

      <Card className="flex flex-wrap items-end justify-between gap-3">
        <PeriodSelect value={period} onChange={setPeriod} />
        <Button type="button" onClick={() => file.mutate()} disabled={data.locked || file.isPending}>
          Mark 3B filed
        </Button>
      </Card>

      <p className="text-sm text-fg-muted">
        Worksheet for {formatGstPeriod(period)}. Outward tax comes from issued invoices; ITC is taken only from
        purchases that appear in GSTR-2B. Cash payable is outward minus 2B ITC — not a live GSTN filing.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Outward taxable" value={`₹ ${inr(data.outward.taxable)}`} />
        <Stat label="ITC claimed (2B)" value={`₹ ${inr(data.itc.igst + data.itc.cgst + data.itc.sgst)}`} />
        <Stat label="Net payable" value={`₹ ${inr(net)}`} />
      </div>

      <Card>
        <h2 className="font-display text-xl">3.1 Outward supplies</h2>
        <TaxTable
          rows={[
            ["Taxable value", data.outward.taxable],
            ["IGST", data.outward.igst],
            ["CGST", data.outward.cgst],
            ["SGST", data.outward.sgst],
            ["Total outward", data.outward.total],
          ]}
        />
      </Card>

      <Card>
        <h2 className="font-display text-xl">4 Eligible ITC (from 2B)</h2>
        <TaxTable
          rows={[
            ["Taxable inward", data.itc.taxable],
            ["IGST", data.itc.igst],
            ["CGST", data.itc.cgst],
            ["SGST", data.itc.sgst],
          ]}
        />
      </Card>

      <Card>
        <h2 className="font-display text-xl">6.1 Payment of tax</h2>
        <TaxTable
          rows={[
            ["IGST payable", data.payable.igst],
            ["CGST payable", data.payable.cgst],
            ["SGST payable", data.payable.sgst],
            ["Net cash", net],
          ]}
          lastStrong
        />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </Card>
  );
}

function TaxTable({ rows, lastStrong }: { rows: [string, number][]; lastStrong?: boolean }) {
  return (
    <dl className="mt-3 space-y-1 font-mono text-sm">
      {rows.map(([k, v], i) => (
        <div
          key={k}
          className={`flex justify-between ${lastStrong && i === rows.length - 1 ? "border-t border-border pt-2 font-medium" : ""}`}
        >
          <span className="font-sans text-fg-muted">{k}</span>
          <span>₹ {inr(v)}</span>
        </div>
      ))}
    </dl>
  );
}
