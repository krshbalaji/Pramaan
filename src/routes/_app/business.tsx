import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GST_PRESETS, INDIAN_STATES, gstinLooksValid, stateFromGstin } from "@/lib/gst/catalog";
import { einvoiceRequired, inr } from "@/lib/gst/engine";
import { applyGstPreset, saveCompany, saveGstin } from "@/lib/gst/server";
import { useWorkspace } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/business")({ component: BusinessPage });

function BusinessPage() {
  const ws = useWorkspace();
  const qc = useQueryClient();
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [pan, setPan] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("27");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branch, setBranch] = useState("");
  const [upi, setUpi] = useState("");
  const [aato, setAato] = useState(0);
  const [role, setRole] = useState("owner");
  const [gstin, setGstin] = useState("");
  const [gstinAddress, setGstinAddress] = useState("");
  const [prefix, setPrefix] = useState("INV");
  const [gstinState, setGstinState] = useState({ code: "27", name: "Maharashtra" });

  useEffect(() => {
    const c = ws.data?.company;
    const g = ws.data?.gstins[0];
    if (!c) return;
    setLegalName(c.legalName);
    setTradeName(c.tradeName);
    setPan(c.pan);
    setAddress1(c.address1);
    setAddress2(c.address2);
    setCity(c.city);
    setStateCode(c.stateCode);
    setPhone(c.phone);
    setEmail(c.email);
    setBankName(c.bankName);
    setAccountName(c.accountName);
    setAccountNo(c.accountNo);
    setIfsc(c.ifsc);
    setBranch(c.branch);
    setUpi(c.upi);
    setAato(c.aato);
    setRole(c.role);
    if (g) {
      setGstin(g.gstin);
      setGstinAddress(g.address);
      setPrefix(g.invoicePrefix);
      setGstinState({ code: g.stateCode, name: g.stateName });
    }
  }, [ws.data]);

  const save = useMutation({
    mutationFn: async () => {
      const c = ws.data!.company;
      const g = ws.data!.gstins[0];
      const st = INDIAN_STATES.find((s) => s.code === stateCode);
      await saveCompany({
        data: {
          id: c.id,
          legalName,
          tradeName,
          pan,
          address1,
          address2,
          city,
          stateCode,
          stateName: st?.name ?? c.stateName,
          phone,
          email,
          bankName,
          accountName,
          accountNo,
          ifsc,
          branch,
          upi,
          aato,
          role,
        },
      });
      if (g) {
        await saveGstin({
          data: {
            id: g.id,
            gstin,
            stateCode: gstinState.code,
            stateName: gstinState.name,
            address: gstinAddress,
            invoicePrefix: prefix,
          },
        });
      }
    },
    onSuccess: () => {
      toast.success("Business profile saved");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const preset = useMutation({
    mutationFn: (name: string) => applyGstPreset({ data: { companyId: ws.data!.company.id, preset: name } }),
    onSuccess: () => {
      toast.success("GST preset applied. Open drafts were recast.");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ws.data) return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;
  const company = ws.data.company;
  const irnDue = einvoiceRequired(aato, company.taxScheme === "COMPOSITION" ? "COMPOSITION" : "REGULAR", true, "tax_invoice");

  function onGstinChange(value: string) {
    const next = value.toUpperCase();
    setGstin(next);
    if (gstinLooksValid(next)) setGstinState(stateFromGstin(next));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Entity</p>
          <h1 className="mt-1 font-display text-3xl">Business</h1>
        </div>
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-fg-subtle">GST scheme</p>
          <p className="mt-1 font-display text-xl">{company.gstPreset}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={irnDue ? "warn" : "success"}>{irnDue ? "E-invoice in scope" : "IRN not mandatory"}</Badge>
          <Select
            className="w-72"
            value={company.gstPreset}
            onChange={(e) => preset.mutate(e.target.value)}
            disabled={preset.isPending}
          >
            {GST_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>
      <p className="text-sm text-fg-muted">
        Changing the preset recasts open drafts: Regular intra-state splits CGST+SGST, inter-state is IGST only,
        Composition issues a Bill of Supply with tax shown for information and not charged.
      </p>

      <Card className="grid gap-3 md:grid-cols-2">
        <Field label="Legal name">
          <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
        </Field>
        <Field label="Trade name">
          <Input value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
        </Field>
        <Field label="PAN">
          <Input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} />
        </Field>
        <Field label="State of registration">
          <Select value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Address">
          <Input value={address1} onChange={(e) => setAddress1(e.target.value)} />
        </Field>
        <Field label="Address 2">
          <Input value={address2} onChange={(e) => setAddress2(e.target.value)} />
        </Field>
        <Field label="City">
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label="AATO (₹)">
          <Input type="number" min={0} value={aato} onChange={(e) => setAato(Number(e.target.value))} />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Workspace role">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">Owner</option>
            <option value="accountant">Accountant</option>
            <option value="ca">CA</option>
            <option value="viewer">Viewer</option>
          </Select>
        </Field>
      </Card>

      <Card className="grid gap-3 md:grid-cols-2">
        <h2 className="font-display text-xl md:col-span-2">GSTIN</h2>
        <Field label="GSTIN">
          <Input value={gstin} onChange={(e) => onGstinChange(e.target.value)} />
          {gstin && !gstinLooksValid(gstin) ? <p className="mt-1 text-xs text-danger">Check the 15-character GSTIN.</p> : null}
        </Field>
        <Field label="Invoice prefix">
          <Input value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} />
        </Field>
        <Field label="GSTIN state">
          <Input readOnly className="bg-calc" value={`${gstinState.code} — ${gstinState.name}`} />
        </Field>
        <Field label="Principal place">
          <Input value={gstinAddress} onChange={(e) => setGstinAddress(e.target.value)} />
        </Field>
      </Card>

      <Card className="grid gap-3 md:grid-cols-2">
        <h2 className="font-display text-xl md:col-span-2">Bank & UPI</h2>
        <Field label="Bank">
          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
        </Field>
        <Field label="Account name">
          <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        </Field>
        <Field label="Account number">
          <Input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} />
        </Field>
        <Field label="IFSC">
          <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} />
        </Field>
        <Field label="Branch">
          <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
        </Field>
        <Field label="UPI">
          <Input value={upi} onChange={(e) => setUpi(e.target.value)} />
        </Field>
      </Card>

      <p className="text-xs text-fg-subtle">Current AATO ₹ {inr(aato)}. E-invoicing threshold is ₹5 crore; 30-day IRN window applies from ₹10 crore.</p>
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
