import type { Store } from '@/db/types';

export function createInMemoryStore<T extends { id: number }>(): Store<T> {
  let rows: T[] = [];
  let nextId = 1;

  return {
    insert(row) {
      const record = { ...row, id: nextId++ } as T;
      rows.push(record);
      return record;
    },
    getAll() {
      return [...rows];
    },
    getById(id) {
      return rows.find((r) => r.id === id);
    },
    update(id, patch) {
      rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    },
  };
}
