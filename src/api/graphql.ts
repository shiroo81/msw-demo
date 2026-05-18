import type { User } from '../mocks/db';

const ENDPOINT = 'https://api.example.com/graphql';

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(body.errors[0].message);
  }
  return body.data as T;
}

export function getUsers() {
  return gql<{ users: User[] }>(/* GraphQL */ `
    query GetUsers {
      users {
        id
        name
        email
        role
      }
    }
  `);
}

export function createUser(input: Omit<User, 'id'>) {
  return gql<{ createUser: User }>(
    /* GraphQL */ `
      mutation CreateUser($input: UserInput!) {
        createUser(input: $input) {
          id
          name
          email
          role
        }
      }
    `,
    { input },
  );
}
