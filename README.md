# MSW Demo

A hands-on demo of [Mock Service Worker (MSW)](https://mswjs.io) — the
industry-standard tool for mocking HTTP APIs in JavaScript apps and tests.

This repository was built to walk a client through **what MSW does, how it
works, and where it pays off** in real product development.

---

## What is MSW, in one paragraph

MSW intercepts outgoing network requests at the network layer — in the browser
via a Service Worker, in Node via request interception. Your application code
keeps making real `fetch` / `axios` / GraphQL calls; MSW decides how those
calls are answered. The same set of "handlers" can power the dev environment,
unit tests, integration tests, and end-to-end tests. There is no special "mock
mode" inside the app, no swapping of API clients, no `if (mock)` branches.

**Why this matters:**

- Frontend can start (and ship features) before the backend is ready.
- Designers, PMs, and QA can demo edge cases (errors, slow networks, empty
  states) without any backend support.
- Tests at every level use the *exact same* mocks as the dev environment, so
  what passes in CI behaves identically to what the developer sees locally.
- Removing MSW from production is a one-line change — nothing in the app code
  has to be refactored.

---

## What this demo contains

The app is a tiny "Users" admin screen with three tabs. Each tab is a focused
showcase of a different MSW capability, and every tab maps to a concrete real-
world use case.

### 1. REST tab — basic CRUD against a mocked backend

**What you see:** A list of seeded users (Ada Lovelace, Alan Turing, Grace
Hopper). You can add a new user, refresh the list, and delete users. All four
HTTP verbs are exercised.

**What MSW is doing:** Handlers in [`src/mocks/rest.ts`](src/mocks/rest.ts)
intercept `GET / POST / PUT / DELETE https://api.example.com/users`. Requests
are answered from an in-memory store ([`src/mocks/db.ts`](src/mocks/db.ts))
that persists for the lifetime of the page.

**Use cases this demonstrates:**
- Building a frontend against an API spec **before the backend exists**.
- Producing a realistic, interactive prototype for stakeholder sign-off.
- Demoing the happy path without depending on a staging environment.

> Verify it's real network traffic: open DevTools → Network and watch the
> `GET /users` and `POST /users` requests appear with proper status codes,
> headers, and JSON payloads.

### 2. GraphQL tab — query + mutation

**What you see:** The same users list, but fetched with a GraphQL query
(`GetUsers`) and a mutation (`CreateUser`). The store is shared with the REST
tab, so a user created via REST is visible via GraphQL and vice-versa.

**What MSW is doing:** Handlers in
[`src/mocks/graphql.ts`](src/mocks/graphql.ts) match GraphQL operations *by
operation name*, not by URL. One MSW library covers both REST and GraphQL with
the same mental model.

**Use cases this demonstrates:**
- Teams migrating from REST to GraphQL — mock both in parallel without a
  second tool.
- Frontend teams that share a "data layer" between REST consumers and Apollo
  / urql / Relay clients.
- Asserting that a GraphQL client correctly sends the right query / variables
  (because MSW sees the raw operation).

### 3. Error & Latency tab — runtime scenario switching

**What you see:** Buttons to inject a `500`, a `401`, a network error, a
3-second delay, or an empty list. After clicking a scenario, hit "GET /users
now" and watch the UI respond accordingly. "Reset to default" restores the
happy path.

**What MSW is doing:** Each button calls `worker.use(...)` with a different
handler, hot-swapping the mock at runtime without a page reload. See
[`src/mocks/scenarios.ts`](src/mocks/scenarios.ts) and
[`src/components/ScenariosDemo.tsx`](src/components/ScenariosDemo.tsx).

**Use cases this demonstrates:**
- **QA & exploratory testing:** reproduce a flaky production error locally on
  demand.
- **Design review:** show product / design how the UI behaves when the
  network is slow, broken, or returns an empty dataset — without waiting for
  the backend to support it.
- **Accessibility & UX:** verify that loading skeletons, retry buttons, and
  error banners actually trigger.
- **Demo safety net:** if the real backend goes down mid-demo, flip a switch
  and keep going.

### 4. Vitest integration — the same handlers in tests

**What you see:** Run `npm test`. Eight tests pass, covering REST CRUD,
GraphQL operations, validation errors, and runtime overrides for error
states. No browser involved.

**What MSW is doing:**
[`src/mocks/node.ts`](src/mocks/node.ts) wraps the same handlers with
`setupServer` from `msw/node`. [`src/test/setup.ts`](src/test/setup.ts)
starts the server before each test file and resets state between tests.

**Use cases this demonstrates:**
- **One source of truth** for mocks across dev and CI — no drift between
  "what the developer sees" and "what the test suite asserts."
- **Deterministic tests** without spinning up a real backend or container.
- **Error-path coverage:** tests use `server.use(...)` to inject failures
  on demand and assert that the UI / data layer handles them
  (see [`src/test/users.test.ts:33`](src/test/users.test.ts)).
- **E2E friendly:** the same handler files can drive Playwright via
  `playwright-msw` if you choose to add it later.

---

## Use-case matrix (what to point at during the walkthrough)

| Question from the client                                | Where in the demo to look                          |
| ------------------------------------------------------- | -------------------------------------------------- |
| "Can we build the frontend before the API is ready?"    | REST tab + `src/mocks/rest.ts`                     |
| "Does it work with GraphQL?"                            | GraphQL tab + `src/mocks/graphql.ts`               |
| "Can we test the error UI?"                             | Error & Latency tab → 500 / network error          |
| "What about slow connections?"                          | Error & Latency tab → 3-second latency             |
| "Do the dev mocks and the test mocks stay in sync?"     | `src/mocks/handlers.ts` — imported by both runtimes |
| "Can we override a single response inside one test?"    | `src/test/users.test.ts:33` (`server.use(...)`)    |
| "What does it cost to remove MSW for production?"       | `src/main.tsx:6-11` — guarded by `import.meta.env.PROD` |

---

## Getting started

```bash
npm install
npm run msw:init     # one-time: generates public/mockServiceWorker.js
npm run dev          # http://localhost:5173
```

Open the app, then open DevTools → Network. Every request to
`https://api.example.com/...` is being served by the Service Worker — note
the "from ServiceWorker" tag.

## Running the tests

```bash
npm test         # one-shot
npm run test:watch  # watch mode
```

The Vitest setup file ([`src/test/setup.ts`](src/test/setup.ts)) boots an
MSW Node server, fails any unhandled request (`onUnhandledRequest: 'error'`),
and resets handlers + in-memory DB between tests.

## Production behaviour

`src/main.tsx` only registers the Service Worker when `import.meta.env.PROD`
is false. In a real build, MSW is a no-op and the same `fetch` calls hit the
real API. To prove this works, run:

```bash
npm run build
npm run preview     # served without the worker
```

---

## Suggested demo script (10 minutes)

1. **Frame the problem (1 min).** "The frontend team can't wait for backend.
   QA can't reproduce error UI. Tests use a different mock library than the
   dev environment, so they drift."

2. **Open `src/mocks/rest.ts` (1 min).** Show a handler. Two lines: the route,
   the response. No DSL.

3. **REST tab (1 min).** Add a user. Refresh. Delete. Open DevTools → Network
   and show the real requests. Emphasise: the app code has no idea it's
   mocked.

4. **GraphQL tab (1 min).** Same store, different protocol. Point at
   `src/mocks/graphql.ts` — operations matched by name.

5. **Error & Latency tab (2 min).** Click "500 Internal Server Error" →
   "GET /users now". Show the error state. Click "3-second latency" → the
   loading spinner runs for 3 seconds. Reset.

6. **Tests (2 min).** Run `npm test`. Open `src/test/users.test.ts`. Show the
   `server.use(...)` override pattern: the same `worker.use(...)` API the user
   just clicked in the browser, but inside a test.

7. **Close (1 min).** Reuse the use-case matrix above. Land the three big
   wins: parallel frontend/backend dev, real edge-case demos, and a single
   source of truth across dev and CI.

---

## Project layout

```
src/
├── api/                 real fetch / GraphQL clients (no mock awareness)
│   ├── users.ts         REST client used by UsersDemo + tests
│   └── graphql.ts       GraphQL client used by GraphQLDemo + tests
├── components/          the three demo tabs
│   ├── UsersDemo.tsx
│   ├── GraphQLDemo.tsx
│   └── ScenariosDemo.tsx
├── mocks/
│   ├── db.ts            in-memory store, shared by REST + GraphQL handlers
│   ├── rest.ts          REST handlers (GET/POST/PUT/DELETE /users)
│   ├── graphql.ts       GraphQL handlers (GetUsers, GetUser, CreateUser)
│   ├── scenarios.ts     runtime-overridable error/latency handlers
│   ├── handlers.ts      default set — combines REST + GraphQL
│   ├── browser.ts       setupWorker — used by the running app
│   └── node.ts          setupServer — used by Vitest
└── test/
    ├── setup.ts         starts/stops the MSW server, resets between tests
    ├── users.test.ts    REST coverage incl. runtime error override
    └── graphql.test.ts  GraphQL coverage incl. runtime error override
```

---

## Further reading

- [mswjs.io](https://mswjs.io) — official documentation
- [mswjs.io / docs / basics / response-resolver](https://mswjs.io/docs/api/http) — handler API
- [Storybook + MSW](https://storybook.js.org/addons/msw-storybook-addon) — same mocks in component stories
- [playwright-msw](https://github.com/valendres/playwright-msw) — same mocks in E2E tests
