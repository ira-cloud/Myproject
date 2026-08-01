import type { Store } from '@/db/types';

// Value types SQLite can actually bind — mirrors expo-sqlite's SQLiteBindValue
// (minus Uint8Array, which this app never binds) without importing it.
type SqlBindValue = string | number | null | boolean;

// Minimal shape we need from expo-sqlite's SQLiteDatabase — kept local so this
// file has zero import-time dependency on the native module and stays easy to
// unit test with a plain mock object.
//
// `runSync`/`getFirstSync` take `params` as a required array because every
// call site in this file always passes one (even when empty). `getAllSync`
// uses a rest parameter instead of an optional array because `getAll()`
// calls it with no params at all — a rest param (0-or-more args) matches
// expo-sqlite's real variadic overload, whereas an *optional* array param
// would make `params` effectively `T[] | undefined`, and `undefined` isn't
// assignable to expo-sqlite's required-params overload, breaking structural
// assignability. This mirrors expo-sqlite's real (overloaded) signatures
// closely enough that a genuine `SQLiteDatabase` is structurally assignable
// to `SqlDb` without any cast.
export interface SqlDb {
  runSync(sql: string, params: SqlBindValue[]): { lastInsertRowId: number };
  getAllSync<T>(sql: string, ...params: SqlBindValue[]): T[];
  getFirstSync<T>(sql: string, params: SqlBindValue[]): T | null;
}

export function createSqliteStore<T extends { id: number }>(
  db: SqlDb,
  table: string,
  columns: string[]
): Store<T> {
  const placeholders = columns.map(() => '?').join(', ');

  return {
    insert(row) {
      const values = columns.map((c) => (row as Record<string, unknown>)[c]) as SqlBindValue[];
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
      const values = patchCols.map((c) => (patch as Record<string, unknown>)[c]) as SqlBindValue[];
      db.runSync(`UPDATE ${table} SET ${clause} WHERE id = ?`, [...values, id]);
    },
  };
}
