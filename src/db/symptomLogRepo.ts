import type { Store } from '@/db/types';
import type { SymptomLog, SymptomTag } from '@/types';

export type LogRow = Omit<SymptomLog, 'tags'> & { tags: string };

export function createSymptomLogRepo(store: Store<LogRow>) {
  return {
    add(date: string, tags: SymptomTag[]): SymptomLog {
      const row = store.insert({ date, tags: JSON.stringify(tags) });
      return { ...row, tags };
    },
    getAll(): SymptomLog[] {
      return store.getAll().map((row) => ({ ...row, tags: JSON.parse(row.tags) }));
    },
  };
}
