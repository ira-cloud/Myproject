import type { Store } from '@/db/types';
import type { SymptomLog, SymptomTag } from '@/types';

export type LogRow = Omit<SymptomLog, 'tags'> & { tags: string };

export function createSymptomLogRepo(store: Store<LogRow>) {
  return {
    add(date: string, tags: SymptomTag[]): SymptomLog {
      const row = store.insert({ date, tags: JSON.stringify(tags) });
      return { ...row, tags };
    },
    // One log per day: tapping "Сохранить" twice must not create two rows for
    // the same date, otherwise findPatterns double-counts that day's symptoms.
    addOrReplace(date: string, tags: SymptomTag[]): SymptomLog {
      const existing = store.getAll().find((row) => row.date === date);
      if (!existing) {
        const row = store.insert({ date, tags: JSON.stringify(tags) });
        return { ...row, tags };
      }
      store.update(existing.id, { tags: JSON.stringify(tags) });
      return { id: existing.id, date, tags };
    },
    getAll(): SymptomLog[] {
      return store.getAll().map((row) => ({ ...row, tags: JSON.parse(row.tags) }));
    },
  };
}
