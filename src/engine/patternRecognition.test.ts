import { findPatterns } from '@/engine/patternRecognition';
import type { CycleEntry, SymptomLog, UserProfile } from '@/types';

const profile: UserProfile = {
  id: 1,
  lastPeriodStart: '2026-05-01',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  dietaryRestrictions: [],
  intensity: 'medium',
  cycleLengthIsEstimate: false,
};

describe('findPatterns', () => {
  it('returns no patterns with fewer than 2 logged cycles', () => {
    const history: CycleEntry[] = [{ id: 1, startDate: '2026-05-01' }];
    const logs: SymptomLog[] = [{ id: 1, date: '2026-05-21', tags: ['bloating'] }];
    expect(findPatterns(logs, history, profile)).toEqual([]);
  });

  it('surfaces a tag that recurs on a similar cycle day across 2+ cycles', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
    ];
    // Cycle 1 (started 04-01): day 21 = 2026-04-21.
    // Cycle 2 (started 04-29): day 20 = 2026-05-18.
    const logs: SymptomLog[] = [
      { id: 1, date: '2026-04-21', tags: ['bloating'] },
      { id: 2, date: '2026-05-18', tags: ['bloating'] },
    ];
    const patterns = findPatterns(logs, history, profile);
    expect(patterns).toEqual([
      { tag: 'bloating', commonCycleDayRange: [20, 21], occurrences: 2 },
    ]);
  });

  it('correctly attributes a log to the cycle that was active at the time, not the most recent one overall', () => {
    // Log falls between the 1st and 2nd recorded period starts, so it must be
    // scored against the 1st start (04-01), even though 04-29 is later in
    // the history array and would be "most recent" for today's date.
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
      { id: 3, startDate: '2026-05-25' }, // irregular: 28-day gap, then 26-day gap
    ];
    const logs: SymptomLog[] = [
      { id: 1, date: '2026-04-10', tags: ['cramps'] }, // day 10 of cycle starting 04-01
      { id: 2, date: '2026-05-08', tags: ['cramps'] }, // day 10 of cycle starting 04-29
    ];
    const patterns = findPatterns(logs, history, profile);
    expect(patterns).toEqual([
      { tag: 'cramps', commonCycleDayRange: [10, 10], occurrences: 2 },
    ]);
  });

  it('ignores a tag that only occurred once', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
    ];
    const logs: SymptomLog[] = [{ id: 1, date: '2026-04-21', tags: ['acne'] }];
    expect(findPatterns(logs, history, profile)).toEqual([]);
  });
});
