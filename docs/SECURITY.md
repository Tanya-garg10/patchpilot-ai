# Security — PatchPilot

## Credential Handling

**Never commit API keys or secrets to source control.**

All credentials must be placed in `.env.local`, which is listed in `.gitignore`. The provided `.env.example` contains only placeholder values.

Required environment variables:

```
EVOROZEN_API_KEY      — Evorozen Neural Pulse API key
EVOROZEN_ENDPOINT     — Neural Pulse API endpoint
EVOROZEN_MODEL        — Model identifier
AI_PROVIDER           — Provider selection (demo | evorozen | external)
```

---

## AI Provider Security

- API keys are only accessed server-side (Next.js API routes or server components)
- The client-side always uses `DemoProvider` — no credentials are exposed to the browser
- `getAIProvider()` checks `typeof window !== 'undefined'` and returns DemoProvider on the client
- No API key is ever included in JavaScript bundles or rendered HTML

---

## Data Handling

**Current scope (demo/hackathon):**
- All data is stored in `localStorage` in the user's browser
- No data is transmitted to any server (except AI provider calls when configured)
- No personally identifiable information is collected or stored
- No analytics or tracking is implemented

**Production considerations:**
- Migrate from localStorage to server-side database (PostgreSQL or SQLite)
- Implement proper authentication before enabling multi-user access
- Encrypt sensitive fields in the database
- Add rate limiting to AI provider API routes

---

## Repository Integration

Current implementation does not connect to real git repositories:
- Source files shown in the UI are embedded demo fixtures (`lib/demo-data.ts`)
- "Apply Fix" updates in-memory state only — no actual file system writes
- No SSH keys, GitHub tokens, or git credentials are required or requested

Future git integration must:
- Scope tokens to read/write only for target repositories
- Never store git tokens in localStorage
- Use server-side token management with appropriate expiry

---

## AI Output Integrity

PatchPilot follows these principles to maintain honesty about AI outputs:

1. **Demo labeling** — All simulated/demo outputs are clearly labeled as such
2. **Confidence as estimate** — AI confidence scores are labeled as AI-generated estimates
3. **No fake claims** — No benchmark numbers, customer results, or API connection status is invented
4. **Human approval gate** — No AI-generated code change is applied without explicit developer approval
5. **Fallback transparency** — When EvorozenProvider falls back to DemoProvider, a console warning is logged

---

## Dependency Security

- Keep `next`, `react`, and all dependencies up to date
- Review `package-lock.json` with `npm audit` before production deployment
- The demo application does not execute arbitrary code from user input

---

## .gitignore

The following files must never be committed:

```
.env.local          # API keys and secrets
.env.*.local        # Environment-specific secrets
node_modules/       # Dependencies
.next/              # Build artifacts
```

See [`.gitignore`](../.gitignore) for the complete file.
