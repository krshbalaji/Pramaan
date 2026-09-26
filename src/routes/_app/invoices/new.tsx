import { createFileRoute } from "@tanstack/react-router";
import { InvoiceForm } from "@/components/gst/invoice-form";
import { useWorkspace } from "@/lib/gst/use-workspace";

export const Route = createFileRoute("/_app/invoices/new")({ component: NewInvoice });

function NewInvoice() {
  const ws = useWorkspace();
  if (!ws.data) return <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" />;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle">Create</p>
        <h1 className="mt-1 font-display text-3xl">New invoice</h1>
      </div>
      <InvoiceForm workspace={ws.data} />
    </div>
  );
}
