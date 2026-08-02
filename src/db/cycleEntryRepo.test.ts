import { createInMemoryStore } from '@/db/inMemoryStore';
import { createSqliteStore } from '@/db/sqliteStore';
import { createCycleEntryRepo, type CycleEntryRow } from '@/db/cycleEntryRepo';
import { CYCLE_ENTRY_COLUMNS } from '@/db/schema';

describe('cycleEntryRepo', () => {
  // Regression test — see the matching test in userProfileRepo.test.ts:
  // the row shape must use the real `start_date` column, not `startDate`.
  it('writes to the real schema column name, not the camelCase field name', () => {
    const db = {
      runSync: jest.fn().mockReturnValue({ lastInsertRowId: 1 }),
      getAllSync: jest.fn().mockReturnValue([]),
      getFirstSync: jest.fn().mockReturnValue(null),
    };
    const repo = createCycleEntryRepo(createSqliteStore<CycleEntryRow>(db as never, 'cycle_entry', CYCLE_ENTRY_COLUMNS));

    repo.add('2026-07-20');

    expect(db.runSync).toHaveBeenCalledWith(
      expect.stringContaining('start_date'),
      ['2026-07-20']
    );
  });


  it('starts empty', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntryRow>());
    expect(repo.getAll()).toEqual([]);
  });

  it('adds an entry and returns it with the given start date', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntryRow>());
    const entry = repo.add('2026-07-20');
    expect(entry.startDate).toBe('2026-07-20');
    expect(repo.getAll()).toHaveLength(1);
  });

  it('accumulates multiple entries across cycles', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntryRow>());
    repo.add('2026-06-01');
    repo.add('2026-06-29');
    repo.add('2026-07-27');
    expect(repo.getAll()).toHaveLength(3);
  });

  describe('addIfAbsent', () => {
    it('inserts and returns a new entry when none exists for that date', () => {
      const repo = createCycleEntryRepo(createInMemoryStore<CycleEntryRow>());
      const entry = repo.addIfAbsent('2026-07-20');
      expect(entry).toEqual({ id: 1, startDate: '2026-07-20' });
      expect(repo.getAll()).toEqual([{ id: 1, startDate: '2026-07-20' }]);
    });

    it('does not insert a second row when an entry already exists for that date', () => {
      const repo = createCycleEntryRepo(createInMemoryStore<CycleEntryRow>());
      const first = repo.add('2026-07-20');

      const result = repo.addIfAbsent('2026-07-20');

      expect(result).toEqual(first);
      expect(repo.getAll()).toEqual([{ id: 1, startDate: '2026-07-20' }]);
      expect(repo.getAll()).toHaveLength(1);
    });
  });
});
