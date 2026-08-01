import { createInMemoryStore } from '@/db/inMemoryStore';
import { createUserProfileRepo, type ProfileRow } from '@/db/userProfileRepo';

describe('userProfileRepo', () => {
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
