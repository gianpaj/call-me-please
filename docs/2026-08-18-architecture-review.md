# Architecture and technical debt review

- Date: 2026-08-18
- Scope: tracked source at `master` commit `ae13542`

## Executive summary

The repository has a workable prototype shape, but it is not safe to expose as
a paid or public calling service. Two credential-boundary failures need
immediate attention:

1. The public LiveKit token endpoint puts the server's OpenAI API key inside a
   JWT returned to the caller.
2. The Expo Auth.js callback accepts an arbitrary redirect URL and appends the
   raw session token to it.

After those fixes, the main architectural problem is ambiguity, not a lack of
infrastructure. The codebase has two authentication systems, two JavaScript
dependency graphs, several incomplete call implementations, and starter CRUD
that does not represent the product. Root checks pass because they exclude the
Expo app, where typecheck and lint currently fail.

The smallest coherent target is:

- one pnpm workspace and lockfile;
- one identity and session authority;
- one authenticated, server-controlled call-authorization boundary;
- one explicit definition of what a "scheduled call" does; and
- one required verification path covering web, mobile, and the worker.

Do not add a queue, event bus, provider abstraction, or more shared packages
until those five decisions are settled.

## Priority guide

- **P0 — contain now:** exploitable credential or session boundary.
- **P1 — address next:** blocks safe delivery or the core product workflow.
- **P2 — address with the next product slice:** significant drag or ambiguity.
- **P3 — schedule later:** useful cleanup after the product boundary is stable.

| Priority | Issue                                                      | Desired outcome                                                                |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| P0       | OpenAI key is disclosed through public token minting       | Provider secrets remain server-side; issuance is authenticated and bounded     |
| P0       | Auth.js session can be sent to an arbitrary redirect       | Mobile auth uses a fixed callback and a one-time exchange                      |
| P1       | Expo sits outside the workspace and root checks            | One install and one root verification path cover the product app               |
| P1       | Supabase Auth and Auth.js both claim identity ownership    | One user ID and one session format cross every boundary                        |
| P1       | Scheduled calling has no durable product workflow          | The product chooses and implements one call lifecycle                          |
| P1       | Builds can pass while validation is skipped                | CI fails on type, lint, test, build, or environment errors                     |
| P2       | Starter data and client-side credits stand in for a domain | Server-owned schedules, call attempts, usage, and ownership replace demo state |
| P2       | Voice-session configuration is duplicated and permissive   | One validated request contract maps to server-owned policy                     |
| P2       | Prototype and platform branches obscure support            | Unsupported paths are deleted; supported platform code has real callers        |
| P2       | Logs and schema changes lack clear ownership               | Redacted lifecycle telemetry and reviewed migrations become routine            |
| P3       | Dependency and runtime policy is fragmented                | Upgrades happen from one lockfile in small verified batches                    |

## Current boundary map

```text
Expo ──POST /api/livekit-token──> Next.js ──JWT──> LiveKit
                                      │               │
                                      │ OpenAI key    │ participant metadata
                                      ▼               ▼
                                   caller      Python LiveKit worker ──> OpenAI

Expo ──> Supabase Auth ──> auth.users / profiles
  └────> Auth.js flow ───> Drizzle user / account / session
Web ───> Auth.js flow ───> Drizzle user / account / session
```

The first flow crosses a provider secret through an untrusted client. The
second set of flows creates two unrelated meanings for "the current user."

## Findings

### 1. P0: LiveKit token issuance discloses the OpenAI key

**Evidence**

- `apps/nextjs/src/app/api/livekit-token/route.ts:9-37` exposes an unauthenticated
  POST handler, parses the body as `any`, and trusts client session settings.
- `apps/nextjs/src/app/api/livekit-token/route.ts:44-59` places
  `env.OPENAI_API_KEY` in participant metadata.
- `apps/nextjs/src/app/api/livekit-token/route.ts:69-72` returns the resulting
  JWT to the caller.
- JWT payloads are encoded and signed, not encrypted. A caller can decode the
  participant metadata without the signing secret.

**Why it matters**

Anyone who can reach the route can recover the provider key and mint a call
without an account, entitlement check, or rate limit. Input also controls
instructions and resource-related session settings. If this route has been
deployed, treat the OpenAI key as exposed.

**Recommendation**

1. Remove the OpenAI key from all client-visible metadata and tokens.
2. Store it only in the Python worker's environment.
3. Require a validated application session before issuing a LiveKit token.
4. Validate a small allowlisted request. Keep model and cost policy on the
   server.
5. Add short token expiry, rate limits, and a server-owned usage check.
6. Rotate the deployed OpenAI key after the corrected path is live.

**Complete when:** decoding a returned token reveals no provider credential,
anonymous issuance fails, invalid settings fail closed, and issuance is covered
by abuse and authorization tests.

### 2. P0: The Expo Auth.js callback can exfiltrate a session

**Evidence**

- `apps/nextjs/src/app/api/auth/[...nextauth]/route.ts:79-90` accepts
  `expo-redirect` from the query string and stores it in a cookie.
- `apps/nextjs/src/app/api/auth/[...nextauth]/route.ts:28-49` extracts the raw
  session token, adds it to that URL, and redirects.
- The code does not restrict the scheme, host, or path, and it does not bind the
  redirect to a nonce or one-time exchange.

**Why it matters**

A crafted sign-in link can direct a newly issued session token to an attacker.
Tokens in URLs also leak through browser history, logs, analytics, and referrer
handling more easily than secure cookies or one-time codes.

**Recommendation**

Use one fixed application callback origin and validate state and nonce. Return
a short-lived, single-use authorization code, then exchange it from the app for
the session. Never put a reusable session token in a redirect URL. If this flow
has been deployed, revoke active sessions after remediation.

**Complete when:** unapproved callback targets are rejected, callbacks are
state-bound, codes are single-use and short-lived, and no reusable session
credential appears in a URL.

### 3. P1: The root workspace excludes the Expo application

**Evidence**

- `pnpm-workspace.yaml:1-4` includes `apps/*`, `packages/*`, and `tooling/*`.
  The mobile app lives at `/expo`.
- `/expo` owns a second `pnpm-lock.yaml` and does not declare the local
  `@acme/eslint-config` or `@acme/api` packages that its source expects.
- Root build, lint, and typecheck passed across 12 packages while omitting Expo.
- A standalone Expo typecheck failed with 28 errors. Expo lint could not load
  the shared config. Its format check reported 41 files.
- `expo/components/VoicesDropdown.tsx` imports `lodash`, which is undeclared in
  `expo/package.json` and resolves only because the root uses a hoisted linker.

**Why it matters**

The primary product app can be broken while the repository is green. Local
success depends on the installation order and packages leaked from the parent
dependency tree.

**Recommendation**

Move Expo to `apps/expo`, or explicitly add `expo` to the workspace. Prefer the
move because the README and Turborepo structure already assume it. Then:

- declare every direct dependency;
- link shared packages through `workspace:*`;
- remove the nested lockfile after a controlled install; and
- make root `typecheck`, `lint`, `format`, and future `test` tasks include Expo.

**Complete when:** a clean checkout needs one frozen install and all root checks
exercise Expo without ancestor dependency leakage.

### 4. P1: Identity has two sources of truth

**Evidence**

- `expo/app/(tabs)/_layout.tsx:11-29` initializes Supabase Auth and stores its
  access token.
- `expo/utils/auth.ts` implements a second mobile session using Auth.js and tRPC.
- `packages/auth/src/config.ts` defines Auth.js with a Drizzle adapter and a
  Discord provider.
- `expo/supabase/migrations/20250105122140_user_management_starter.sql` creates
  profiles linked to Supabase `auth.users`.
- The same migration allows anyone to upload to the public avatar bucket at
  lines 42-52.
- `packages/db/src/schema.ts:25-80` defines separate Auth.js user, account, and
  session tables.
- The README promises Google, Apple, email, SMS, and Supabase, while active web
  code signs in with Discord.

**Why it matters**

Schedules, credits, call ownership, deletion, and support cannot rely on a
stable user ID. Authentication fixes made in one path may leave the other path
exposed or inconsistent.

**Recommendation**

Choose one authority before adding product tables. Either choice can work;
preserving both cannot remain the default. The decision should specify:

- canonical user ID and session format;
- mobile and web sign-in flows;
- provider support actually required now;
- how the API validates sessions; and
- how any existing identities migrate.

Delete the unselected auth code, proxy, schema, and documentation rather than
maintaining a compatibility layer for unused behavior. If Supabase remains,
restrict storage writes to the authenticated owner and test every RLS policy.

**Complete when:** mobile, web, tRPC, token issuance, and database ownership use
the same user ID and session validation path.

### 5. P1: The core scheduled-call workflow is undefined

**Evidence**

- The README describes scheduled AI voice calls as the product.
- The scheduling handler in `expo/app/(tabs)/index.tsx:88-112` is commented out.
- `expo/services/notificationServices.ts` and `expo/utils/permissions.ts` create
  local notifications only; neither creates or starts a durable call.
- CallKeep and Android foreground-service setup are commented out in
  `expo/app/_layout.tsx:19-25`, and the corresponding packages are undeclared.
- No schema represents a schedule, call attempt, status transition, retry, or
  idempotency key.

**Why it matters**

"Scheduled call" can mean two very different products:

1. a local alarm that asks the user to open an in-app audio session; or
2. a real incoming VoIP/PSTN call initiated by a backend.

Those choices have different reliability, platform, permission, cost, and
store-policy constraints. Building both halfway has already produced dead
branches.

**Recommendation**

Choose one meaning. The smallest first release is the local alarm plus in-app
call: store the alarm locally, open one call screen, and avoid pretending it is
a background incoming call. If a true incoming call is required, write that as
a separate capability with a server-owned schedule, delivery worker, platform
push/telephony integration, idempotent attempts, and explicit retry states.

**Complete when:** one documented state flow is implemented end to end and the
unsupported interpretation has been removed from UI and docs.

### 6. P1: Delivery checks can pass while important validation is absent

**Evidence**

- No CI workflow or test file is tracked, and the root package has no `test`
  script.
- `apps/nextjs/next.config.js:21-22` sets both `ignoreDuringBuilds` and
  `ignoreBuildErrors`.
- `apps/nextjs/src/env.ts:42-43` and `packages/auth/env.ts:16-17` skip
  environment validation whenever `CI` is set.
- The production build passed while reporting "Skipping validation of types"
  and "Skipping linting."

**Why it matters**

A green build does not mean the application is type-safe, linted, configured,
or tested. The excluded Expo app makes that gap larger.

**Recommendation**

Create one required CI workflow after workspace unification:

1. frozen install;
2. environment-schema test with safe test values;
3. typecheck and lint with zero warnings;
4. focused unit tests for token/auth boundaries;
5. web/API and Expo builds; and
6. Python import, static check, and focused worker tests.

Remove Next.js validation bypasses once the checks pass. CI should skip access
to live secrets, not skip schema validation.

**Complete when:** the same root commands fail locally and in CI for a broken
Expo type, unsafe auth case, missing required environment variable, or failed
worker test.

### 7. P2: Demo state substitutes for the product domain

**Evidence**

- `packages/db/src/schema.ts:6-23` and `packages/api/src/router/post.ts` retain
  generic Post CRUD from the starter.
- Posts have no owner field, so any authenticated user can delete any post.
- No server model exists for a schedule, call, usage record, or credit balance.
- `expo/store/store.ts:27-30` keeps credits in persisted client state and simply
  decrements the number. The guard that would stop calls at zero is commented
  out in `expo/app/(tabs)/index.tsx:70-73`.

**Why it matters**

Client credits cannot protect paid provider usage, and generic starter tables
make the repository look more complete than the product actually is.

**Recommendation**

Delete Post CRUD when the first real domain slice lands. Add only the records
required by the chosen scheduling model. Keep entitlement and usage decisions
on the server and record each authorized call against the canonical user.
Avoid designing a general billing ledger before paid credits are actually in
scope.

**Complete when:** every paid call has a server-authorized owner and usage
record, and no production route depends on the starter Post model or a client
credit counter.

### 8. P2: The voice-session contract is duplicated and permissive

**Evidence**

- `expo/store/livekit-state.ts` defines a client session shape.
- `apps/nextjs/src/app/api/livekit-token/route.ts` destructures it as `any`,
  renames fields, and places them in metadata.
- `apps/webrtc-server/main.py:60-86` parses a loose dictionary into another
  shape with defaults and conversions.
- `apps/webrtc-server/main.py:89-330` and `:332-369` contain two agent
  implementations. `entrypoint_old` is the implementation actually registered
  at line 380.

**Why it matters**

There is no single place to tell which settings are supported, trusted, or
billed. Malformed input can fail far from the request, and dead implementations
make behavior harder to change safely.

**Recommendation**

Define a small versioned request schema at the API boundary. Accept user intent
such as voice and prompt preset, then map it to an internal worker configuration
owned by the server. Keep model, limits, provider key, and expensive options
out of the client contract. Remove the unused agent implementation.

**Complete when:** one schema rejects malformed or unsupported input before
token issuance, and one worker entry point consumes a documented internal
configuration.

### 9. P2: Prototype branches obscure supported platform behavior

**Evidence**

- Supabase and Auth.js mobile components coexist, and much of their UI is
  commented out.
- `expo/store/store.ts:8-24` defines an API key and persists it through
  AsyncStorage, creating a client-secret storage footgun even though the field
  is not active.
- `expo/hooks/useTrackVolume.tsx` uses browser Web Audio types even though the
  file notes that they do not work in React Native.
- CallKeep and foreground-service adapters import undeclared packages and have
  no active caller.
- Several production files contain large commented prototypes and suppressed
  type rules.

**Why it matters**

Engineers cannot distinguish dormant experiments from required production
paths. Type errors and missing packages become normalized instead of useful
signals.

**Recommendation**

After choosing auth and scheduling semantics, delete abandoned paths. Keep
platform-specific adapters only behind a narrow interface with an active use
case and platform tests. Prefer a short decision note in `plans/` over commented
code when an idea may return later.

**Complete when:** the Expo source tree contains only supported flows and can be
understood without treating comments or ignored errors as configuration.

### 10. P2: Operations and database evolution lack one owner

**Evidence**

- `expo/app/_layout.tsx:22` enables LiveKit debug logs in every environment.
- `expo/app/(tabs)/_layout.tsx:20` logs the Supabase session, and
  `packages/api/src/trpc.ts:48` logs the session user.
- Connection failures mostly stop at `console.error` without stable call or
  request identifiers.
- Drizzle exposes `db:push`, but no Drizzle migration history is tracked.
- The only SQL migration and Supabase configuration live below the standalone
  Expo app.

**Why it matters**

Production logs may collect personal or session data without providing a
usable call timeline. Schema ownership is equally unclear: a mobile directory
and a backend package can both appear authoritative.

**Recommendation**

- emit redacted structured events for authorization, room connection, agent
  start, call end, and failure under one correlation ID;
- disable debug logging in production and never log session objects;
- choose one canonical migration directory and owner; and
- deploy reviewed, forward-only migrations instead of schema push.

**Complete when:** one call can be traced across services without exposing
credentials or personal session data, and every production schema change is a
reviewed migration.

### 11. P3: Dependency and runtime policy is fragmented

**Evidence**

- Root packages use workspace catalogs; Expo resolves independent version
  ranges and a second lockfile.
- Committed manifests include beta Auth.js and release-candidate tRPC versions.
- The auth-proxy build reports no compatibility date and falls back to an
  implicit 2024 date.
- JavaScript, Expo, and Python runtimes are pinned in separate files without a
  single verification entry point.

**Recommendation**

Unify the workspace and package-manager version before broad upgrades. Then
upgrade one risky boundary at a time with focused tests: auth, tRPC, Expo/native
modules, and LiveKit. Set the auth proxy's compatibility date explicitly.

**Complete when:** a clean install is deterministic, runtime policy is visible
from the root, and upgrades do not mix with architecture changes.

## Recommended sequence

### Stage 0: Contain credentials and sessions

- Remove and rotate the exposed OpenAI key.
- Protect LiveKit token issuance with auth, validation, expiry, and rate limits.
- Replace the arbitrary Expo redirect and URL session token with a fixed,
  state-bound one-time exchange.
- Add regression tests for both attack paths.

Do this before further feature work or public testing.

### Stage 1: Establish one development and identity boundary

- Move Expo into the workspace and remove the second dependency graph.
- Choose Supabase Auth or Auth.js as the sole identity authority.
- Remove unused auth and starter code.
- Make root lint, typecheck, test, and build commands authoritative in CI.

### Stage 2: Ship one honest call vertical

- Decide local alarm plus in-app call versus real incoming call.
- Define the smallest lifecycle and persistence needed by that choice.
- Authorize each call server-side and record ownership and usage.
- Use one validated session contract and one Python entry point.

### Stage 3: Harden operation and evolve deliberately

- Add redacted lifecycle telemetry and failure reporting.
- Adopt reviewed database migrations.
- Upgrade dependencies in isolated batches.
- Add broader end-to-end coverage only after the core path is stable.

## Explicit non-goals

The review does not recommend microservices, a generic AI-provider layer, an
event-driven platform, or a full billing ledger. None solves the current
constraint. The project first needs fewer sources of truth and an end-to-end
path whose behavior is unsurprising.

## Verification performed

| Check                          | Result                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| `CI=1 pnpm typecheck`          | Passed for 12 root workspace packages; Expo was absent                                      |
| `CI=1 pnpm lint`               | Passed for root packages with one warning; Expo was absent                                  |
| `CI=1 pnpm build`              | Passed; Next.js skipped type and lint validation; Nitro warned about its compatibility date |
| Expo `tsc --noEmit`            | Failed with 28 errors                                                                       |
| Expo ESLint                    | Failed before linting because `@acme/eslint-config` was unresolved                          |
| Expo Prettier check            | Failed for 41 files                                                                         |
| `uv sync --frozen --no-dev`    | Passed with Python 3.11.15                                                                  |
| Python worker import           | Passed in the locked uv environment                                                         |
| Tracked tests and CI workflows | None found                                                                                  |

The review excluded the untracked `PROMPT_GOOGLE_FLASH_APP.md` and the user's
uncommitted `.tool-versions` change. It made no source-code changes.
