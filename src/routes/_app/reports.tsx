import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inr } from "@/lib/gst/engine";
import { getReports, listPurchases } from "@/lib/gst/server";
import { useActiveCompanyId } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

function ReportsPage() {
  const companyId = useActiveCompanyId();
  const reports = useQuery({
    queryKey: ["reports", companyId],
    queryFn: () => getReports({ data: companyId! }),
    enabled: companyId != null,
  });
  const purchases = useQuery({
    queryKey: ["purchases", companyId],
    queryFn: () => listPurchases({ data: companyId! }),
    enabled: companyId != null,
  });

  if (!reports.data) return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;
  const { byParty, register } = reports.data;
  const chart = byParty.slice(0, 6).map((r) => ({ name: r.name.split(" ")[0], amount: r.amount }));

  function downloadRegister() {
    const rows = [
      ["Number", "Date", "Party", "Type", "Taxable", "CGST", "SGST", "IGST", "Total", "Status"],
      ...register.map((r) => [
        r.number,
        r.issueDate,
        r.party,
        r.docType,
        String(r.taxable),
        String(r.cgst),
        String(r.sgst),
        String(r.igst),
        String(r.total),
        r.status,
      ]),
    ];
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-register.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Books</p>
          <h1 className="mt-1 font-display text-3xl">Registers</h1>
        </div>
        <Button type="button" variant="outline" onClick={downloadRegister}>
          Export sales CSV
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="font-display text-xl">Sales by party</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `₹ ${inr(Number(value ?? 0))}`} />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl">Party totals</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {byParty.map((p) => (
              <li key={p.name} className="flex justify-between gap-3 py-2">
                <span>
                  {p.name}
                  <span className="ml-2 text-xs text-fg-subtle">{p.invoices} docs</span>
                </span>
                <span className="font-mono">₹ {inr(p.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="px-4 py-3">
          <h2 className="font-display text-xl">Sales register</h2>
        </div>
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-y border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Taxable</th>
              <th className="px-4 py-3 text-right">CGST</th>
              <th className="px-4 py-3 text-right">SGST</th>
              <th className="px-4 py-3 text-right">IGST</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {register.map((r, i) => (
              <tr key={`${r.number}-${i}`} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{r.number}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.issueDate}</td>
                <td className="px-4 py-3">{r.party}</td>
                <td className="px-4 py-3">{r.docType.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 text-right font-mono">{inr(r.taxable)}</td>
                <td className="px-4 py-3 text-right font-mono">{inr(r.cgst)}</td>
                <td className="px-4 py-3 text-right font-mono">{inr(r.sgst)}</td>
                <td className="px-4 py-3 text-right font-mono">{inr(r.igst)}</td>
                <td className="px-4 py-3 text-right font-mono">₹ {inr(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-x-auto p-0">
        <div className="px-4 py-3">
          <h2 className="font-display text-xl">Purchase register</h2>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-y border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Bill</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Taxable</th>
              <th className="px-4 py-3 text-right">Tax</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">2B</th>
            </tr>
          </thead>
          <tbody>
            {(purchases.data ?? []).map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{p.number}</td>
                <td className="px-4 py-3">{p.vendorName}</td>
                <td className="px-4 py-3">{p.issueDate}</td>
                <td className="px-4 py-3 text-right font-mono">{inr(p.taxable)}</td>
                <td className="px-4 py-3 text-right font-mono">{inr(p.cgst + p.sgst + p.igst)}</td>
                <td className="px-4 py-3 text-right font-mono">₹ {inr(p.total)}</td>
                <td className="px-4 py-3">{p.inGstr2b ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
