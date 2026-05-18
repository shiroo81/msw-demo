export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

const seed: User[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' },
  { id: '2', name: 'Alan Turing', email: 'alan@example.com', role: 'editor' },
  { id: '3', name: 'Grace Hopper', email: 'grace@example.com', role: 'editor' },
];

let store: User[] = [...seed];
let nextId = seed.length + 1;

export const db = {
  list(): User[] {
    return [...store];
  },
  get(id: string): User | undefined {
    return store.find((u) => u.id === id);
  },
  create(input: Omit<User, 'id'>): User {
    const user: User = { id: String(nextId++), ...input };
    store.push(user);
    return user;
  },
  update(id: string, patch: Partial<Omit<User, 'id'>>): User | undefined {
    const user = store.find((u) => u.id === id);
    if (!user) return undefined;
    Object.assign(user, patch);
    return user;
  },
  delete(id: string): boolean {
    const before = store.length;
    store = store.filter((u) => u.id !== id);
    return store.length < before;
  },
  reset(): void {
    store = [...seed];
    nextId = seed.length + 1;
  },
};
