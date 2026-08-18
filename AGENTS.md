# Repository guidance

These instructions apply to the entire repository.

## Working principles

- Prefer the smallest mental model that makes correct behavior unsurprising.
- Measure twice, cut once. Confirm the active product path before editing it.
- Apply YAGNI. Do not preserve dead branches or add infrastructure for a
  hypothetical future.
- Fight scope creep. Keep changes narrow, complete, and easy to review.
- Preserve unrelated worktree changes. Never assume an untracked file or an
  existing modification belongs to the current task.

## Repository map

- `apps/nextjs`: landing page, Auth.js routes, tRPC API, and LiveKit token route.
- `apps/auth-proxy`: Nitro OAuth proxy inherited from the T3 starter.
- `apps/webrtc-server`: Python LiveKit/OpenAI worker managed with uv.
- `expo`: React Native application. It currently has its own lockfile and is
  outside the root pnpm workspace.
- `packages/api`: tRPC context and routers.
- `packages/auth`: Auth.js configuration and session validation.
- `packages/db`: Drizzle schema and database client.
- `packages/ui`: shared web UI components.
- `packages/validators`: shared validation package.
- `tooling`: shared TypeScript, ESLint, Prettier, and Tailwind configuration.
- `docs`: durable reviews and project documentation.
- `plans`: plans, designs, and specifications.

Read `docs/2026-08-18-architecture-review.md` before changing authentication,
LiveKit token issuance, scheduling, credits, or workspace structure.

## Current setup

Use the pinned runtime versions when possible.

### Root workspace

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm build
```

The root commands do not currently include `expo`. A passing root check is not
proof that the mobile app passes.

### Expo

Until Expo joins the root workspace, install and check it independently:

```bash
cd expo
pnpm --ignore-workspace install --frozen-lockfile
pnpm --ignore-workspace typecheck
pnpm --ignore-workspace lint
pnpm --ignore-workspace format
```

Do not suppress existing Expo failures or rely on packages hoisted from the
root. Declare every direct dependency in `expo/package.json`.

### Python worker

```bash
cd apps/webrtc-server
uv sync --frozen --no-dev
uv run python -c "import main"
```

## Architecture constraints

- Keep provider credentials server-side. Never put an OpenAI, LiveKit, or
  database secret in a client bundle, public environment variable, redirect
  URL, JWT payload, or participant metadata returned to a client.
- Authenticate and authorize LiveKit token issuance. Validate input at the API
  boundary, keep model and cost limits on the server, and use short-lived
  grants.
- Never put reusable session tokens in URLs. Allowlist mobile callback targets
  and bind OAuth callbacks to state and nonce.
- Maintain one canonical identity authority. Do not extend both Supabase Auth
  and Auth.js in the same change unless the task is an explicit migration.
- Treat credits, entitlements, and paid usage as server-owned state. Client
  counters are display state only.
- Validate external input with a narrow schema. Avoid passing arbitrary client
  configuration through multiple services.
- Never log credentials, tokens, complete sessions, or user objects. Use
  redacted structured events and stable correlation IDs.
- Use reviewed database migrations for durable schema changes. Do not make
  production deployment depend on an unreviewed schema push.

## Change guidance

- Choose the supported path, then delete the abandoned path. Avoid compatibility
  layers for unused starter or prototype behavior.
- Prefer one end-to-end vertical slice over new generic packages or framework
  abstractions.
- Do not introduce a queue, event bus, service split, AI-provider abstraction,
  or billing ledger without a concrete requirement that needs it.
- Keep platform-specific mobile behavior behind a narrow interface only when it
  has an active caller and a verification path.
- Add dependencies only when the active implementation imports them. Remove
  imports and prototypes that the product no longer supports.

## Verification

- Run the narrowest relevant check while iterating, then run all affected root,
  Expo, and Python checks before handoff.
- Run typecheck and lint explicitly. The current Next.js production build skips
  both validations.
- Add focused tests for changed trust boundaries, especially auth redirects,
  token issuance, authorization, usage enforcement, and input validation.
- Do not fix unrelated failures silently. Record them and keep the task diff
  scoped.
- Inspect `git diff --check`, `git diff --stat`, and `git status --short` before
  committing.

## Documentation and notes

- Keep the README focused on current setup and supported behavior.
- Use `.agents/notes` for temporary review evidence and working decisions. Move
  durable conclusions into `docs` or `plans`.
- Save plans, designs, and specifications in `plans`, not a `brainstorm` or
  generated-spec directory.
- Prefix plan filenames with the date, for example
  `plans/2026-08-18-call-lifecycle.md`.

## Git commits

Use a short commitlint-style message:

- use the imperative mood;
- keep the subject near 50 characters;
- capitalize the description;
- do not end the subject with punctuation; and
- add a wrapped body only when it adds useful context.

Example:

```text
docs: Document architecture risks
```

Do not stage or commit unrelated user changes.

## Pull requests

- Open pull requests ready for review, not as drafts.
- Use a concise title that explains why the change matters.
- Start the description with the problem or functionality from the original
  request, then explain the solution.
- Do not lead with an implementation inventory.
