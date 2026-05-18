import { graphql, HttpResponse } from 'msw';
import { db, type User } from './db';

interface CreateUserVars {
  input: Omit<User, 'id'>;
}

interface UserVars {
  id: string;
}

export const graphqlHandlers = [
  graphql.query('GetUsers', () => {
    return HttpResponse.json({ data: { users: db.list() } });
  }),

  graphql.query<{ user: User | null }, UserVars>('GetUser', ({ variables }) => {
    const user = db.get(variables.id) ?? null;
    return HttpResponse.json({ data: { user } });
  }),

  graphql.mutation<{ createUser: User }, CreateUserVars>(
    'CreateUser',
    ({ variables }) => {
      const { input } = variables;
      if (!input.name || !input.email) {
        return HttpResponse.json({
          errors: [{ message: 'name and email are required' }],
        });
      }
      const created = db.create({
        name: input.name,
        email: input.email,
        role: input.role ?? 'viewer',
      });
      return HttpResponse.json({ data: { createUser: created } });
    },
  ),
];
