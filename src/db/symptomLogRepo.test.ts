import { createInMemoryStore } from '@/db/inMemoryStore';
import { createSymptomLogRepo, type LogRow } from '@/db/symptomLogRepo';

describe('symptomLogRepo', () => {
  it('starts empty', () => {
    const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
    expect(repo.getAll()).toEqual([]);
  });

  it('adds a log entry and stores tags as a real array on read', () => {
    const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
    repo.add('2026-07-25', ['bloating', 'sugar_craving']);

    const [log] = repo.getAll();
    expect(log.date).toBe('2026-07-25');
    expect(log.tags).toEqual(['bloating', 'sugar_craving']);
  });

  it('keeps separate entries for different days', () => {
    const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
    repo.add('2026-07-24', ['cramps']);
    repo.add('2026-07-25', ['bloating']);
    expect(repo.getAll()).toHaveLength(2);
  });

  describe('addOrReplace', () => {
    it('inserts a new entry when nothing is logged for that day yet', () => {
      const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
      repo.addOrReplace('2026-07-25', ['cramps']);

      expect(repo.getAll()).toEqual([{ id: 1, date: '2026-07-25', tags: ['cramps'] }]);
    });

    it('replaces the tags of the existing entry for that day instead of duplicating it', () => {
      const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
      repo.addOrReplace('2026-07-25', ['cramps']);
      repo.addOrReplace('2026-07-25', ['bloating', 'acne']);

      expect(repo.getAll()).toEqual([{ id: 1, date: '2026-07-25', tags: ['bloating', 'acne'] }]);
    });

    it('returns the log it wrote, reusing the existing id on replace', () => {
      const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
      const inserted = repo.addOrReplace('2026-07-25', ['cramps']);
      const replaced = repo.addOrReplace('2026-07-25', ['acne']);

      expect(inserted).toEqual({ id: 1, date: '2026-07-25', tags: ['cramps'] });
      expect(replaced).toEqual({ id: 1, date: '2026-07-25', tags: ['acne'] });
    });

    it('leaves other days untouched', () => {
      const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
      repo.addOrReplace('2026-07-24', ['cramps']);
      repo.addOrReplace('2026-07-25', ['bloating']);
      repo.addOrReplace('2026-07-25', ['acne']);

      expect(repo.getAll()).toEqual([
        { id: 1, date: '2026-07-24', tags: ['cramps'] },
        { id: 2, date: '2026-07-25', tags: ['acne'] },
      ]);
    });
  });
});
