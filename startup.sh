#!/bin/sh
set -eu
cd /workspace
# :8081 is QA-only — a revive must never inherit a stale built-output preview.
node scripts/preview.mjs stop || true
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
# Wait until the sandbox process actually accepts HTTP. Exit immediately after
# backgrounding used to race the validator (connection refused ≠ auth redirect).
i=0
while [ "$i" -lt 60 ]; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.5
done
echo "startup.sh: http://127.0.0.1:8080/ did not become ready" >&2
exit 1
