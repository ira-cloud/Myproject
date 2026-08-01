import type { Store } from '@/db/types';

// Minimal shape we need from expo-sqlite's SQLiteDatabase — kept local so this
// file has zero import-time dependency on the native module and stays easy to
// unit test with a plain mock object.
export interface SqlDb {
  runSync(sql: string, params?: unknown[]): { lastInsertRowId: number };
  getAllSync<T>(sql: string, params?: unknown[]): T[];
  getFirstSync<T>(sql: string, params?: unknown[]): T | null;
}

export function createSqliteStore<T extends { id: number }>(
  db: SqlDb,
  table: string,
  columns: string[]
): Store<T> {
  const placeholders = columns.map(() => '?').join(', ');

  return {
    insert(row) {
      const values = columns.map((c) => (row as Record<string, unknown>)[c]);
      const result = db.runSync(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
      return { ...row, id: result.lastInsertRowId } as T;
    },
    getAll() {
      return db.getAllSync<T>(`SELECT * FROM ${table}`);
    },
    getById(id) {
      return db.getFirstSync<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]) ?? undefined;
    },
    update(id, patch) {
      const patchCols = Object.keys(patch);
      if (patchCols.length === 0) return;
      const clause = patchCols.map((c) => `${c} = ?`).join(', ');
      const values = patchCols.map((c) => (patch as Record<string, unknown>)[c]);
      db.runSync(`UPDATE ${table} SET ${clause} WHERE id = ?`, [...values, id]);
    },
  };
}
