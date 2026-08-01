import type { Store } from '@/db/types';
import type { CycleEntry } from '@/types';

export function createCycleEntryRepo(store: Store<CycleEntry>) {
  return {
    add(startDate: string): CycleEntry {
      return store.insert({ startDate });
    },
    // One period-start entry per day: tapping "Месячные начались сегодня"
    // twice must not insert a second row for the same date, otherwise the
    // rolling cycle-length average in calculatePhase double-counts that day
    // and reports a spurious short/irregular cycle. A start date for a given
    // day either happened or didn't — there's nothing to update, so unlike
    // symptomLogRepo.addOrReplace, an existing match is returned untouched.
    addIfAbsent(startDate: string): CycleEntry | undefined {
      const existing = store.getAll().find((entry) => entry.startDate === startDate);
      if (existing) {
        return existing;
      }
      return store.insert({ startDate });
    },
    getAll(): CycleEntry[] {
      return store.getAll();
    },
  };
}
