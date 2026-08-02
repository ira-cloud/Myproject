import type { Store } from '@/db/types';
import type { CycleEntry } from '@/types';

// SQLite's column is `start_date` (snake_case, see schema.ts); CycleEntry's
// field is `startDate` (camelCase). This row shape matches the real table so
// the Store<T> passed in here writes/reads the actual column name — mapping
// to/from the camelCase domain type happens in this file only.
export interface CycleEntryRow {
  id: number;
  start_date: string;
}

function fromRow(row: CycleEntryRow): CycleEntry {
  return { id: row.id, startDate: row.start_date };
}

export function createCycleEntryRepo(store: Store<CycleEntryRow>) {
  return {
    add(startDate: string): CycleEntry {
      return fromRow(store.insert({ start_date: startDate }));
    },
    // One period-start entry per day: tapping "Месячные начались сегодня"
    // twice must not insert a second row for the same date, otherwise the
    // rolling cycle-length average in calculatePhase double-counts that day
    // and reports a spurious short/irregular cycle. A start date for a given
    // day either happened or didn't — there's nothing to update, so unlike
    // symptomLogRepo.addOrReplace, an existing match is returned untouched.
    addIfAbsent(startDate: string): CycleEntry {
      const existing = store.getAll().find((row) => row.start_date === startDate);
      if (existing) {
        return fromRow(existing);
      }
      return fromRow(store.insert({ start_date: startDate }));
    },
    getAll(): CycleEntry[] {
      return store.getAll().map(fromRow);
    },
  };
}
