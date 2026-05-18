import { describe, it, expect } from 'vitest';
import { graphql, HttpResponse } from 'msw';
import { server } from '../mocks/node';
import { getUsers, createUser } from '../api/graphql';

describe('Users GraphQL API (via MSW)', () => {
  it('runs GetUsers query against the shared in-memory store', async () => {
    const { users } = await getUsers();
    expect(users).toHaveLength(3);
  });

  it('runs CreateUser mutation', async () => {
    const { createUser: created } = await createUser({
      name: 'Hedy Lamarr',
      email: 'hedy@example.com',
      role: 'editor',
    });
    expect(created.name).toBe('Hedy Lamarr');

    const { users } = await getUsers();
    expect(users.map((u) => u.email)).toContain('hedy@example.com');
  });

  it('runtime override: returns a GraphQL error', async () => {
    server.use(
      graphql.query('GetUsers', () =>
        HttpResponse.json({ errors: [{ message: 'service unavailable' }] }),
      ),
    );
    await expect(getUsers()).rejects.toThrow(/service unavailable/);
  });
});
