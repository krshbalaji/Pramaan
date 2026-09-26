import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-fg-subtle">GST compliance</p>
        <h1 className="mt-2 font-display text-4xl">Pramaan</h1>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Raise GST-ready invoices, generate sandbox IRNs, and draft GSTR-1 / GSTR-3B from the same ledger.
        </p>
        <div className="mt-8 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-fg-muted">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
