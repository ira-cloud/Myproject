import { createInMemoryStore } from '@/db/inMemoryStore';

interface Widget { id: number; name: string; qty: number }

describe('createInMemoryStore', () => {
  it('assigns incrementing ids on insert', () => {
    const store = createInMemoryStore<Widget>();
    const a = store.insert({ name: 'A', qty: 1 });
    const b = store.insert({ name: 'B', qty: 2 });
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
  });

  it('returns all inserted rows', () => {
    const store = createInMemoryStore<Widget>();
    store.insert({ name: 'A', qty: 1 });
    store.insert({ name: 'B', qty: 2 });
    expect(store.getAll()).toHaveLength(2);
  });

  it('finds a row by id', () => {
    const store = createInMemoryStore<Widget>();
    const a = store.insert({ name: 'A', qty: 1 });
    expect(store.getById(a.id)?.name).toBe('A');
    expect(store.getById(999)).toBeUndefined();
  });

  it('updates a row by id, leaving other fields untouched', () => {
    const store = createInMemoryStore<Widget>();
    const a = store.insert({ name: 'A', qty: 1 });
    store.update(a.id, { qty: 5 });
    expect(store.getById(a.id)).toEqual({ id: a.id, name: 'A', qty: 5 });
  });
});
