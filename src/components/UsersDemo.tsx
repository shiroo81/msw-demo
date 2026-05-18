import { useEffect, useState } from 'react';
import { listUsers, createUser, deleteUser, type User } from '../api/users';

export function UsersDemo() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createUser({ name, email, role: 'viewer' });
      setName('');
      setEmail('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      await deleteUser(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user');
    }
  }

  return (
    <div>
      <h2>REST: /users</h2>
      <p>
        All requests below hit <code>https://api.example.com/users</code> and are intercepted by
        MSW. Check the Network tab to verify.
      </p>

      <form onSubmit={onAdd} className="row">
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
        <button type="submit">Add user (POST)</button>
        <button type="button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh (GET)'}
        </button>
      </form>

      {error && <div className="error">Error: {error}</div>}

      <ul className="user-list">
        {users.map((u) => (
          <li key={u.id}>
            <span>
              <strong>{u.name}</strong> — {u.email} <code>{u.role}</code>
            </span>
            <button onClick={() => onDelete(u.id)} aria-label={`Delete ${u.name}`}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
