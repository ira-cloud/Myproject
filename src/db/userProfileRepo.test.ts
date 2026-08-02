import { createInMemoryStore } from '@/db/inMemoryStore';
import { createSqliteStore } from '@/db/sqliteStore';
import { createUserProfileRepo, type ProfileRow } from '@/db/userProfileRepo';
import { USER_PROFILE_COLUMNS } from '@/db/schema';

function createMockDb() {
  return {
    runSync: jest.fn().mockReturnValue({ lastInsertRowId: 1 }),
    getAllSync: jest.fn().mockReturnValue([]),
    getFirstSync: jest.fn().mockReturnValue(null),
  };
}

describe('userProfileRepo', () => {
  // Regression test: an earlier version built the SQLite row with the
  // domain object's camelCase keys (lastPeriodStart, avgCycleLength, ...)
  // instead of the real snake_case column names, so every INSERT silently
  // wrote NULLs and crashed on the NOT NULL last_period_start column — only
  // caught by running on a real device, since every other test here uses
  // the in-memory store, which doesn't care what the keys are named.
  it('writes to the real schema column names, not the camelCase field names', () => {
    const db = createMockDb();
    const repo = createUserProfileRepo(createSqliteStore<ProfileRow>(db as never, 'user_profile', USER_PROFILE_COLUMNS));

    repo.save({
      lastPeriodStart: '2026-07-20',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      dietaryRestrictions: ['vegetarian'],
      intensity: 'medium',
      cycleLengthIsEstimate: false,
    });

    expect(db.runSync).toHaveBeenCalledWith(
      expect.stringContaining('last_period_start'),
      expect.arrayContaining(['2026-07-20'])
    );
    const [, boundValues] = db.runSync.mock.calls[0];
    expect(boundValues).not.toContain(undefined);
  });


  it('returns undefined when no profile has been saved yet', () => {
    const repo = createUserProfileRepo(createInMemoryStore<ProfileRow>());
    expect(repo.get()).toBeUndefined();
  });

  it('saves a profile and reads it back with restrictions as a real array', () => {
    const repo = createUserProfileRepo(createInMemoryStore<ProfileRow>());

    repo.save({
      lastPeriodStart: '2026-07-20',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      dietaryRestrictions: ['vegetarian', 'gluten_free'],
      intensity: 'medium',
      cycleLengthIsEstimate: false,
    });

    const profile = repo.get();
    expect(profile?.dietaryRestrictions).toEqual(['vegetarian', 'gluten_free']);
    expect(profile?.avgCycleLength).toBe(28);
  });

  it('overwrites the existing profile on a second save instead of creating a new one', () => {
    const repo = createUserProfileRepo(createInMemoryStore<ProfileRow>());
    repo.save({
      lastPeriodStart: '2026-07-01',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      dietaryRestrictions: [],
      intensity: 'light',
      cycleLengthIsEstimate: true,
    });
    repo.save({
      lastPeriodStart: '2026-07-20',
      avgCycleLength: 30,
      avgPeriodLength: 6,
      dietaryRestrictions: ['dairy_free'],
      intensity: 'super',
      cycleLengthIsEstimate: false,
    });

    const profile = repo.get();
    expect(profile?.avgCycleLength).toBe(30);
    expect(profile?.dietaryRestrictions).toEqual(['dairy_free']);
  });
});
