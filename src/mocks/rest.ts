import { http, HttpResponse, delay } from 'msw';
import { db, type User } from './db';

const API = 'https://api.example.com';

export const restHandlers = [
  http.get(`${API}/users`, async () => {
    await delay(150);
    return HttpResponse.json(db.list());
  }),

  http.get(`${API}/users/:id`, async ({ params }) => {
    const user = db.get(String(params.id));
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.post(`${API}/users`, async ({ request }) => {
    const body = (await request.json()) as Omit<User, 'id'>;
    if (!body?.name || !body?.email) {
      return HttpResponse.json(
        { message: 'name and email are required' },
        { status: 400 },
      );
    }
    const created = db.create({
      name: body.name,
      email: body.email,
      role: body.role ?? 'viewer',
    });
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(`${API}/users/:id`, async ({ params, request }) => {
    const patch = (await request.json()) as Partial<Omit<User, 'id'>>;
    const updated = db.update(String(params.id), patch);
    if (!updated) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(updated);
  }),

  http.delete(`${API}/users/:id`, async ({ params }) => {
    const removed = db.delete(String(params.id));
    if (!removed) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
