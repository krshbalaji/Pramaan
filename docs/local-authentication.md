# Local authentication (Windows / `npm run dev`)

This is the intended workflow. It is **not** a workaround and it does **not**
weaken OAuth redirect validation.

## What works

| Environment | How you sign in |
| --- | --- |
| Grok-hosted live preview (`https://*.grok-sandbox.com`) | Zero-click gate identity (`x-grok-identity`), or Google/X via the baked `grok_preview` client. **This is the supported OAuth path.** |
| Deployed Pramaan | Per-app `GROK_AUTH_CLIENT_ID` injected by the platform. Google/X work. |
| Local `http://localhost:8080` (`npm run dev`) | App loads. Better Auth **accepts** the localhost origin. **Google/X OAuth cannot complete.** |

A Grok-hosted preview that already shows a signed-in name and **Sign out** is
the proof that Pramaan’s Better Auth implementation is fine.

## Why localhost Google sign-in returns `Invalid redirect URI`

Pramaan federates to the Grok broker (`https://auth.grok.me`) with the shared
preview client `client_id=grok_preview`.

That client is registered **only** for:

```text
https://*.grok-sandbox.com/api/auth/oauth2/callback/*
```

On `npm run dev`, Better Auth sends:

```text
redirect_uri=http://localhost:8080/api/auth/oauth2/callback/grok-google
```

The broker accepts the authorize request and forwards to Google (Google’s own
callback is always `https://auth.grok.me/api/auth/callback/google`). After
Google, the broker refuses to redirect back to localhost:

```json
{"message":"Invalid redirect URI"}
```

HTTP 400. That check lives on the **broker**, not in Pramaan. Adding localhost
to Pramaan `trustedOrigins` (already done for CSRF / origin checks) does **not**
register a broker redirect URI.

Do **not**:

- add `http://*` or other wildcard redirects
- disable Better Auth origin / CSRF checks
- replace `grok_preview` with guessed credentials
- fake a `*.grok-sandbox.com` callback from localhost

## Intended local workflow

1. **Product OAuth / GST UI with a real signed-in user:** use the Grok live
   preview. Sign-in already works there.
2. **Local `npm run dev` on Windows:** use the app unsigned, or enable
   email/password (the only supported non-broker local method) by setting
   `emailAndPasswordEnabled = true` in `src/lib/auth/email-password.ts` and
   adding email forms. Do **not** edit `src/lib/auth/server.ts`.
3. **Do not expect** `grok_preview` + Google to finish on `localhost:8080`.

A dedicated localhost OAuth client would have to be **provisioned on
`auth.grok.me`**. Pramaan cannot invent that client.

## Grok validator vs Windows `npm run dev`

These are different machines. The validator tests **B: the sandbox-local
Pramaan process**, which is also what the Grok-hosted preview proxies.

- Windows `npm run dev` → **your** `localhost:8080`. The harness never sees it.
- Harness / live preview → **this VM** `127.0.0.1:8080` via `/workspace/startup.sh`
  (`npm run dev --host 0.0.0.0 --port 8080`).
- `startup.sh` now waits until that port answers (HTTP 307 to `/login` counts as
  ready). Then `npm run check:preview` (`scripts/check-preview-ready.mjs`).
- Unsigned harness: `get-session` is `null`, `/invoices/new` → `/login`. That is
  **reachable + auth on**, not “app down”.
- Signed GST UI validation uses the **Grok-hosted preview** (gate identity).
  Direct `http://127.0.0.1:6014` is 403 outside the preview proxy.

Do not report “not reachable” unless the sandbox probe gets connection refused.
