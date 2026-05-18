import { http, HttpResponse, delay } from 'msw';

/**
 * Runtime-overridable handlers used by the "Error & Latency" tab.
 * Showcases worker.use(...) to swap a handler at runtime — the same
 * technique you use in tests to assert error-state UI.
 */

const API = 'https://api.example.com';

export const scenarios = {
  serverError: http.get(`${API}/users`, () =>
    HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
  ),

  unauthorized: http.get(`${API}/users`, () =>
    HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
  ),

  networkError: http.get(`${API}/users`, () => HttpResponse.error()),

  slow: http.get(`${API}/users`, async () => {
    await delay(3000);
    return HttpResponse.json([
      { id: '99', name: 'Slow Response', email: 'slow@example.com', role: 'viewer' },
    ]);
  }),

  empty: http.get(`${API}/users`, () => HttpResponse.json([])),
};

export type ScenarioName = keyof typeof scenarios;
