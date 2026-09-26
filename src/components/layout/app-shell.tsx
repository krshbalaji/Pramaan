import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  Package,
  QrCode,
  Receipt,
  Scale,
  ScrollText,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCompanyStore } from "@/lib/gst/company-store";
import { getWorkspace, listCompanies } from "@/lib/gst/server";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Ledger", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/einvoice", label: "E-Invoice", icon: QrCode },
  { to: "/returns/gstr-1", label: "GSTR-1", icon: FileSpreadsheet },
  { to: "/returns/gstr-3b", label: "GSTR-3B", icon: ScrollText },
  { to: "/reconciliation", label: "Reconcile", icon: Scale },
  { to: "/masters/customers", label: "Parties", icon: Users },
  { to: "/masters/products", label: "Catalog", icon: Package },
  { to: "/reports", label: "Registers", icon: BookOpen },
  { to: "/business", label: "Business", icon: Building2 },
];

export function AppShell() {
  const { user, isPending } = useCurrentUserState();
  const me = useCurrentUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const companyId = useCompanyStore((s) => s.companyId);
  const setCompanyId = useCompanyStore((s) => s.setCompanyId);

  const companies = useQuery({
    queryKey: ["companies"],
    queryFn: () => listCompanies(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!companyId && companies.data?.[0]) setCompanyId(companies.data[0].id);
  }, [companies.data, companyId, setCompanyId]);

  const ws = useQuery({
    queryKey: ["workspace", companyId],
    queryFn: () => getWorkspace({ data: companyId ?? undefined }),
    enabled: !!user && companyId != null,
  });

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-6 text-fg-muted">
        <div className="text-center">
          <p className="font-display text-2xl text-fg">Pramaan</p>
          <p className="mt-2 text-sm">Opening ledger…</p>
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm",
              active ? "bg-primary text-primary-fg" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
          <Brand />
          <p className="mb-4 mt-1 text-[11px] uppercase tracking-[0.16em] text-fg-subtle">GST ledger</p>
          {nav}
          <div className="mt-auto pt-6 text-[11px] text-fg-subtle">
            {ws.data?.company.legalName}
            <div className="mt-1 font-mono">{ws.data?.gstins[0]?.gstin}</div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:h-16 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen(true)} aria-label="Open menu">
                <Menu className="size-5" />
              </button>
              <Brand compact />
            </div>
            <div className="hidden text-sm text-fg-muted md:block">
              {me?.displayName ?? me?.primaryEmail ?? "Signed in"}
            </div>
            <div className="ml-auto flex items-center gap-3">
              {companies.data && companies.data.length > 1 ? (
                <select
                  className="h-11 max-w-40 rounded-[var(--radius-sm)] border border-border bg-card px-2 text-sm"
                  value={companyId ?? ""}
                  onChange={(e) => setCompanyId(Number(e.target.value))}
                >
                  {companies.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.legalName}
                    </option>
                  ))}
                </select>
              ) : null}
              <UserButton />
            </div>
          </header>
          <main className="px-4 py-5 md:px-8 md:py-7">
            <Outlet />
          </main>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-fg/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 bg-surface p-4 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center justify-between">
              <Brand />
              <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-baseline gap-2">
      <span className="font-display text-xl tracking-tight">Pramaan</span>
      {compact ? null : <span className="text-[10px] uppercase tracking-[0.2em] text-fg-subtle">India</span>}
    </Link>
  );
}
