import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { authEnabled } from "@/lib/auth/client";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context }) => {
    if (authEnabled && !context.sessionUser) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppShell,
});
