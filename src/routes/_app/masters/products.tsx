import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CUSTOM_PRODUCT_CODE, UNITS, hsnRequiredDigits } from "@/lib/gst/catalog";
import { inr } from "@/lib/gst/engine";
import { deleteProduct, saveProduct } from "@/lib/gst/server";
import type { Product } from "@/lib/gst/types";
import { useWorkspace } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/masters/products")({ component: ProductsPage });

type Draft = {
  id?: number;
  code: string;
  description: string;
  kind: string;
  hsnSac: string;
  unit: string;
  rate: number;
  taxability: string;
  active: boolean;
};

function blank(): Draft {
  return {
    code: "",
    description: "",
    kind: "service",
    hsnSac: "",
    unit: "Project",
    rate: 0,
    taxability: "taxable",
    active: true,
  };
}

function ProductsPage() {
  const ws = useWorkspace();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const save = useMutation({
    mutationFn: (d: Draft) =>
      saveProduct({
        data: {
          id: d.id,
          companyId: ws.data!.company.id,
          code: d.code,
          description: d.description,
          kind: d.kind,
          hsnSac: d.hsnSac,
          unit: d.unit,
          rate: d.rate,
          taxability: d.taxability,
          active: d.active,
        },
      }),
    onSuccess: () => {
      toast.success("Catalog item saved");
      setDraft(null);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: id }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ws.data) return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;
  const digits = hsnRequiredDigits(ws.data.company.aato);

  function fromProduct(p: Product): Draft {
    return {
      id: p.id,
      code: p.code,
      description: p.description,
      kind: p.kind,
      hsnSac: p.hsnSac,
      unit: p.unit,
      rate: p.rate,
      taxability: p.taxability,
      active: p.active,
    };
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Masters</p>
          <h1 className="mt-1 font-display text-3xl">Catalog</h1>
        </div>
        <Button type="button" onClick={() => setDraft(blank())}>
          Add item
        </Button>
      </div>
      <p className="text-sm text-fg-muted">
        Invoice lines pick from this list. Qty is the only field typed on a regular line. Custom mode is the reserved{" "}
        {CUSTOM_PRODUCT_CODE} row. HSN / SAC should be at least {digits} digits at this AATO.
      </p>

      {draft ? (
        <Card className="grid gap-3 md:grid-cols-2">
          <Field label="Code">
            <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </Field>
          <Field label="Kind">
            <Select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
              <option value="service">Service</option>
              <option value="product">Product</option>
              <option value="custom">Custom placeholder</option>
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
          </div>
          <Field label="HSN / SAC">
            <Input value={draft.hsnSac} onChange={(e) => setDraft({ ...draft, hsnSac: e.target.value })} />
          </Field>
          <Field label="Unit">
            <Select value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field label="Rate (USD / INR as billed)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={draft.rate}
              onChange={(e) => setDraft({ ...draft, rate: Number(e.target.value) })}
            />
          </Field>
          <Field label="Taxability">
            <Select value={draft.taxability} onChange={(e) => setDraft({ ...draft, taxability: e.target.value })}>
              <option value="taxable">Taxable</option>
              <option value="exempt">Exempt</option>
              <option value="nil">Nil rated</option>
            </Select>
          </Field>
          <Field label="Active">
            <Select value={draft.active ? "yes" : "no"} onChange={(e) => setDraft({ ...draft, active: e.target.value === "yes" })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </Field>
          <div className="flex items-end gap-2 md:col-span-2">
            <Button type="button" disabled={save.isPending || !draft.code || !draft.description} onClick={() => save.mutate(draft)}>
              Save item
            </Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">HSN / SAC</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {ws.data.products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-3">{p.description}</td>
                <td className="px-4 py-3 font-mono">{p.hsnSac || "—"}</td>
                <td className="px-4 py-3">{p.unit}</td>
                <td className="px-4 py-3 text-right font-mono">{inr(p.rate)}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Active" : "Hidden"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="mr-3 text-sm text-accent" onClick={() => setDraft(fromProduct(p))}>
                    Edit
                  </button>
                  {p.code !== CUSTOM_PRODUCT_CODE ? (
                    <button type="button" className="text-sm text-danger" onClick={() => del.mutate(p.id)}>
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
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
