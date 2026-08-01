import type { Store } from '@/db/types';
import type { CycleEntry } from '@/types';

export function createCycleEntryRepo(store: Store<CycleEntry>) {
  return {
    add(startDate: string): CycleEntry {
      return store.insert({ startDate });
    },
    getAll(): CycleEntry[] {
      return store.getAll();
    },
  };
}
