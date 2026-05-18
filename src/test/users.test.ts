import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/node';
import { listUsers, createUser, deleteUser } from '../api/users';

describe('Users REST API (via MSW)', () => {
  it('lists seeded users', async () => {
    const users = await listUsers();
    expect(users).toHaveLength(3);
    expect(users[0].name).toBe('Ada Lovelace');
  });

  it('creates and then lists a new user', async () => {
    const created = await createUser({
      name: 'Margaret Hamilton',
      email: 'margaret@example.com',
      role: 'admin',
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Margaret Hamilton');

    const users = await listUsers();
    expect(users.map((u) => u.name)).toContain('Margaret Hamilton');
  });

  it('deletes a user', async () => {
    await deleteUser('1');
    const users = await listUsers();
    expect(users.map((u) => u.id)).not.toContain('1');
  });

  it('rejects invalid payloads with 400', async () => {
    await expect(
      // @ts-expect-error testing runtime validation
      createUser({ name: '' }),
    ).rejects.toThrow(/required/);
  });

  it('runtime override: surface a 500 to test error UI', async () => {
    server.use(
      http.get('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    await expect(listUsers()).rejects.toThrow(/HTTP 500/);
  });
});
