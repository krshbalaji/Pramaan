#!/usr/bin/env node
/**
 * Sandbox preview readiness — NOT the developer's Windows localhost.
 *
 * The Grok harness and live-preview proxy talk to THIS VM's
 * http://127.0.0.1:8080 (bound 0.0.0.0:8080 via `npm run dev` / startup.sh).
 *
 * HTTP 307 → /login is REACHABLE. Auth is ON; an unsigned harness session is
 * expected. Connection refused is the only "not reachable" outcome.
 */
const BASE = process.env.PREVIEW_URL || "http://127.0.0.1:8080";

async function probe(path) {
  const url = new URL(path, BASE).href;
  try {
    const res = await fetch(url, { redirect: "manual" });
    return {
      ok: true,
      status: res.status,
      location: res.headers.get("location"),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

const root = await probe("/");
const login = await probe("/login");
const invoicesNew = await probe("/invoices/new");
let session = null;
try {
  const res = await fetch(new URL("/api/auth/get-session", BASE).href);
  session = await res.text();
} catch {
  session = null;
}

const reachable = root.ok && typeof root.status === "number";
const report = {
  target: BASE,
  note: "This is the Grok sandbox loopback, not a Windows npm run dev host.",
  reachable,
  root,
  login,
  invoicesNew,
  getSession: session,
  interpretation: reachable
    ? root.status === 307 && (root.location || "").includes("/login")
      ? "reachable_unsigned: app is up; unsigned harness correctly redirected to /login"
      : "reachable"
    : "not_reachable: no process answering on this sandbox 8080 (Windows localhost is a different machine)",
};

console.log(JSON.stringify(report, null, 2));
process.exit(reachable ? 0 : 2);
