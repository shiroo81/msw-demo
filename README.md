# MSW Demo

A focused demo of [Mock Service Worker](https://mswjs.io) for a client walkthrough.

MSW intercepts real network requests (via a Service Worker in the browser, or
request interception in Node) so the app uses the same `fetch` calls in
development, in tests, and in production. No fake API client, no `if (mock)`
branches — the *network* is mocked, not the code.

## What this demo shows

| Tab | Demonstrates |
| --- | --- |
| **REST (CRUD)** | `GET / POST / PUT / DELETE` against an in-memory store. Real `fetch` calls, intercepted by MSW. |
| **GraphQL** | `GetUsers` query + `CreateUser` mutation matched by operation name. Shared store with REST. |
| **Error & Latency** | Runtime swap with `worker.use(...)` to simulate 500s, 401s, network errors, slow responses, and empty states. |

Tests under `src/test/` re-use the **same** handlers via `setupServer` from
`msw/node` — proving the dev-time mocks and the test-time mocks stay in sync.

## Getting started

```bash
npm install
npm run msw:init     # one-time: generates public/mockServiceWorker.js
npm run dev          # http://localhost:5173
```

Open DevTools → Network. You'll see real requests to
`https://api.example.com/users` being served by the Service Worker.

## Running the tests

```bash
npm test
```

Tests use `setupServer` from `msw/node` — identical handlers, no browser
involved. See `src/test/setup.ts`.

## Demo script (suggested order)

1. **Open `src/mocks/rest.ts`** — show that handlers are just functions that
   return a `Response`. No DSL, no special "mock" config.

2. **Hit the REST tab** — add a user, refresh, delete a user. Point at the
   Network tab: the requests are real, the handler is the network.

3. **Hit the GraphQL tab** — same store, but matched by operation name.
   One library, both protocols.

4. **Hit the Error & Latency tab** — click "500 Internal Server Error", then
   "GET /users now". The UI shows the error path. Click "3-second latency" —
   the loading state hangs for 3 seconds. This is `worker.use(...)`:

   ```ts
   worker.use(
     http.get('https://api.example.com/users', () =>
       HttpResponse.json({ message: 'boom' }, { status: 500 }),
     ),
   );
   ```

5. **Run `npm test`** — show that the same handlers cover the test suite.
   Point at `src/test/users.test.ts:36` where a test overrides the handler
   to assert error UI:

   ```ts
   server.use(
     http.get('https://api.example.com/users', () =>
       HttpResponse.json({ message: 'boom' }, { status: 500 }),
     ),
   );
   await expect(listUsers()).rejects.toThrow(/HTTP 500/);
   ```

6. **Close with the value proposition** — the team writes handlers once and
   gets:
   - A working app before the backend exists
   - Deterministic tests at unit, integration, and (with Playwright) E2E levels
   - Designers and PMs can demo edge cases (errors, empty, slow) without backend support

## Project layout

```
src/
├── api/              real fetch / GraphQL clients (no mock awareness)
├── components/       three demo tabs
├── mocks/
│   ├── db.ts         in-memory store, shared by REST + GraphQL handlers
│   ├── rest.ts       REST handlers
│   ├── graphql.ts    GraphQL handlers
│   ├── scenarios.ts  runtime-overridable error/latency handlers
│   ├── handlers.ts   default export combining REST + GraphQL
│   ├── browser.ts    setupWorker for dev/runtime
│   └── node.ts       setupServer for tests
└── test/             Vitest specs using the same handlers
```
