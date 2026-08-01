import { createInMemoryStore } from '@/db/inMemoryStore';
import { createCycleEntryRepo } from '@/db/cycleEntryRepo';
import type { CycleEntry } from '@/types';

describe('cycleEntryRepo', () => {
  it('starts empty', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
    expect(repo.getAll()).toEqual([]);
  });

  it('adds an entry and returns it with the given start date', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
    const entry = repo.add('2026-07-20');
    expect(entry.startDate).toBe('2026-07-20');
    expect(repo.getAll()).toHaveLength(1);
  });

  it('accumulates multiple entries across cycles', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
    repo.add('2026-06-01');
    repo.add('2026-06-29');
    repo.add('2026-07-27');
    expect(repo.getAll()).toHaveLength(3);
  });

  describe('addIfAbsent', () => {
    it('inserts and returns a new entry when none exists for that date', () => {
      const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
      const entry = repo.addIfAbsent('2026-07-20');
      expect(entry).toEqual({ id: 1, startDate: '2026-07-20' });
      expect(repo.getAll()).toEqual([{ id: 1, startDate: '2026-07-20' }]);
    });

    it('does not insert a second row when an entry already exists for that date', () => {
      const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
      const first = repo.add('2026-07-20');

      const result = repo.addIfAbsent('2026-07-20');

      expect(result).toEqual(first);
      expect(repo.getAll()).toEqual([{ id: 1, startDate: '2026-07-20' }]);
      expect(repo.getAll()).toHaveLength(1);
    });
  });
});
