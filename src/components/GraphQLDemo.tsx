import { useEffect, useState } from 'react';
import { getUsers, createUser } from '../api/graphql';
import type { User } from '../mocks/db';

export function GraphQLDemo() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createUser({ name, email, role: 'viewer' });
      setName('');
      setEmail('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mutation failed');
    }
  }

  return (
    <div>
      <h2>GraphQL: query + mutation</h2>
      <p>
        Same backend, same handlers file convention — MSW matches by operation name
        (<code>GetUsers</code>, <code>CreateUser</code>).
      </p>

      <form onSubmit={onCreate} className="row">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Run CreateUser mutation</button>
        <button type="button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading…' : 'Run GetUsers query'}
        </button>
      </form>

      {error && <div className="error">GraphQL error: {error}</div>}

      <pre>
        {JSON.stringify({ users }, null, 2)}
      </pre>
    </div>
  );
}
