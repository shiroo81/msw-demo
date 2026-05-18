import { useState } from 'react';
import { worker } from '../mocks/browser';
import { scenarios, type ScenarioName } from '../mocks/scenarios';
import { handlers } from '../mocks/handlers';
import { listUsers, type User } from '../api/users';

const labels: Record<ScenarioName, string> = {
  serverError: '500 Internal Server Error',
  unauthorized: '401 Unauthorized',
  networkError: 'Network error (offline)',
  slow: '3-second latency',
  empty: 'Empty list',
};

export function ScenariosDemo() {
  const [active, setActive] = useState<ScenarioName | 'default'>('default');
  const [result, setResult] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function applyScenario(name: ScenarioName) {
    worker.use(scenarios[name]);
    setActive(name);
  }

  function resetScenario() {
    worker.resetHandlers(...handlers);
    setActive('default');
  }

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await listUsers();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Runtime scenario switching</h2>
      <p>
        <code>worker.use(handler)</code> overrides a handler at runtime — the same API used in
        tests to assert error-state UI without touching the network.
      </p>

      <div className="row">
        {(Object.keys(scenarios) as ScenarioName[]).map((name) => (
          <button
            key={name}
            onClick={() => applyScenario(name)}
            aria-pressed={active === name}
          >
            {labels[name]}
          </button>
        ))}
        <button onClick={resetScenario} aria-pressed={active === 'default'}>
          Reset to default
        </button>
      </div>

      <div className="row">
        <button onClick={run} disabled={loading}>
          {loading ? 'Fetching…' : 'GET /users now'}
        </button>
        <span>
          Active: <code>{active}</code>
        </span>
      </div>

      {error && <div className="error">Error: {error}</div>}
      {result && (
        <div className="success">
          Got {result.length} user{result.length === 1 ? '' : 's'}.
        </div>
      )}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
