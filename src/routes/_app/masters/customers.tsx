import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { INDIAN_STATES, gstinLooksValid, stateFromGstin } from "@/lib/gst/catalog";
import { deleteParty, saveParty } from "@/lib/gst/server";
import type { Party } from "@/lib/gst/types";
import { useWorkspace } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/masters/customers")({ component: PartiesPage });

type Draft = {
  id?: number;
  kind: string;
  name: string;
  gstin: string;
  pan: string;
  stateCode: string;
  stateName: string;
  address1: string;
  address2: string;
  city: string;
  contact: string;
};

function blank(): Draft {
  return {
    kind: "customer",
    name: "",
    gstin: "",
    pan: "",
    stateCode: "27",
    stateName: "Maharashtra",
    address1: "",
    address2: "",
    city: "",
    contact: "",
  };
}

function PartiesPage() {
  const ws = useWorkspace();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const save = useMutation({
    mutationFn: (d: Draft) =>
      saveParty({
        data: {
          id: d.id,
          companyId: ws.data!.company.id,
          kind: d.kind,
          name: d.name,
          gstin: d.gstin,
          pan: d.pan,
          stateCode: d.stateCode,
          stateName: d.stateName,
          address1: d.address1,
          address2: d.address2,
          city: d.city,
          contact: d.contact,
        },
      }),
    onSuccess: () => {
      toast.success("Party saved");
      setDraft(null);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: number) => deleteParty({ data: id }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ws.data) return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;
  const parties = ws.data.parties;

  function fromParty(p: Party): Draft {
    return {
      id: p.id,
      kind: p.kind,
      name: p.name,
      gstin: p.gstin,
      pan: p.pan,
      stateCode: p.stateCode,
      stateName: p.stateName,
      address1: p.address1,
      address2: p.address2,
      city: p.city,
      contact: p.contact,
    };
  }

  function onGstin(value: string) {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, gstin: value.toUpperCase() };
      if (gstinLooksValid(value)) {
        const st = stateFromGstin(value);
        next.stateCode = st.code;
        next.stateName = st.name;
      }
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Masters</p>
          <h1 className="mt-1 font-display text-3xl">Parties</h1>
        </div>
        <Button type="button" onClick={() => setDraft(blank())}>
          Add party
        </Button>
      </div>

      {draft ? (
        <Card className="grid gap-3 md:grid-cols-2">
          <Field label="Kind">
            <Select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </Select>
          </Field>
          <Field label="Legal name">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="GSTIN">
            <Input value={draft.gstin} onChange={(e) => onGstin(e.target.value)} placeholder="Optional for B2C" />
            {draft.gstin && !gstinLooksValid(draft.gstin) ? (
              <p className="mt-1 text-xs text-danger">GSTIN should be 15 characters (state + PAN + entity + Z + check).</p>
            ) : null}
          </Field>
          <Field label="PAN">
            <Input value={draft.pan} onChange={(e) => setDraft({ ...draft, pan: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="State">
            <Select
              value={draft.stateCode}
              onChange={(e) => {
                const st = INDIAN_STATES.find((s) => s.code === e.target.value);
                setDraft({ ...draft, stateCode: e.target.value, stateName: st?.name ?? draft.stateName });
              }}
            >
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City">
            <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
          </Field>
          <Field label="Address">
            <Input value={draft.address1} onChange={(e) => setDraft({ ...draft, address1: e.target.value })} />
          </Field>
          <Field label="Address 2">
            <Input value={draft.address2} onChange={(e) => setDraft({ ...draft, address2: e.target.value })} />
          </Field>
          <Field label="Contact">
            <Input value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
          </Field>
          <div className="flex items-end gap-2 md:col-span-2">
            <Button type="button" disabled={save.isPending || !draft.name} onClick={() => save.mutate(draft)}>
              Save party
            </Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">GSTIN</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 capitalize">{p.kind}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.gstin || "—"}</td>
                <td className="px-4 py-3">
                  {p.stateCode}-{p.stateName}
                </td>
                <td className="px-4 py-3">{p.city}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="mr-3 text-sm text-accent" onClick={() => setDraft(fromParty(p))}>
                    Edit
                  </button>
                  <button type="button" className="text-sm text-danger" onClick={() => del.mutate(p.id)}>
                    Remove
                  </button>
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
