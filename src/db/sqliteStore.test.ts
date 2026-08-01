import { createSqliteStore } from '@/db/sqliteStore';

interface Widget { id: number; name: string; qty: number }

function createMockDb() {
  return {
    runSync: jest.fn().mockReturnValue({ lastInsertRowId: 42 }),
    getAllSync: jest.fn().mockReturnValue([{ id: 1, name: 'A', qty: 1 }]),
    getFirstSync: jest.fn().mockReturnValue({ id: 1, name: 'A', qty: 1 }),
  };
}

describe('createSqliteStore', () => {
  it('builds a parameterized INSERT and returns the row with the new id', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    const result = store.insert({ name: 'A', qty: 1 });

    expect(db.runSync).toHaveBeenCalledWith(
      'INSERT INTO widgets (name, qty) VALUES (?, ?)',
      ['A', 1]
    );
    expect(result).toEqual({ name: 'A', qty: 1, id: 42 });
  });

  it('queries all rows with SELECT *', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    const rows = store.getAll();

    expect(db.getAllSync).toHaveBeenCalledWith('SELECT * FROM widgets');
    expect(rows).toHaveLength(1);
  });

  it('queries a single row by id', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    store.getById(1);

    expect(db.getFirstSync).toHaveBeenCalledWith('SELECT * FROM widgets WHERE id = ?', [1]);
  });

  it('builds a parameterized UPDATE for the given patch fields only', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    store.update(1, { qty: 9 });

    expect(db.runSync).toHaveBeenCalledWith('UPDATE widgets SET qty = ? WHERE id = ?', [9, 1]);
  });

  it('does nothing when update is called with an empty patch', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    store.update(1, {});

    expect(db.runSync).not.toHaveBeenCalled();
  });
});
