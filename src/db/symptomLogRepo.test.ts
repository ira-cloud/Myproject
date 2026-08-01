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
});
