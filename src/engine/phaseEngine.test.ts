import { calculatePhase, getPhaseBoundaries } from '@/engine/phaseEngine';
import type { CycleEntry, UserProfile } from '@/types';

const baseProfile: UserProfile = {
  id: 1,
  lastPeriodStart: '2026-07-01',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  dietaryRestrictions: [],
  intensity: 'medium',
  cycleLengthIsEstimate: false,
};

describe('calculatePhase', () => {
  it('is day 1, menstrual phase, on the first day of the period', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-01'));
    expect(result).toEqual({ cycleDay: 1, phase: 'menstrual', isApproximate: false });
  });

  it('is follicular phase on day 8 of a 28-day cycle', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-08'));
    expect(result.cycleDay).toBe(8);
    expect(result.phase).toBe('follicular');
  });

  it('is ovulatory phase on day 14 of a 28-day cycle', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-14'));
    expect(result.phase).toBe('ovulatory');
  });

  it('is luteal phase on day 21 of a 28-day cycle', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-21'));
    expect(result.cycleDay).toBe(21);
    expect(result.phase).toBe('luteal');
  });

  it('wraps to day 1 of the next cycle after avgCycleLength days', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-29'));
    expect(result.cycleDay).toBe(1);
    expect(result.phase).toBe('menstrual');
  });

  it('uses the rolling average of the last cycles once 3+ are logged, not the onboarding guess', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-05-01' }, // 30-day gap
      { id: 3, startDate: '2026-05-31' }, // 30-day gap
    ];
    // 30 days after the most recent start (2026-05-31) is 2026-06-30 -> day 30 wraps to day 1
    // of a fresh 30-day cycle, i.e. still menstrual, not day 30 of a 28-day cycle.
    const result = calculatePhase(baseProfile, history, new Date('2026-06-30'));
    expect(result.cycleDay).toBe(1);
    expect(result.phase).toBe('menstrual');
  });

  it('flags isApproximate when the last cycles vary by more than 7 days', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-03-01' },
      { id: 2, startDate: '2026-04-01' }, // 31-day gap
      { id: 3, startDate: '2026-04-15' }, // 14-day gap -> spread of 17 days
    ];
    const result = calculatePhase(baseProfile, history, new Date('2026-04-20'));
    expect(result.isApproximate).toBe(true);
  });

  it('flags isApproximate when the user was not sure of her cycle length and no real history exists yet', () => {
    const estimateProfile = { ...baseProfile, cycleLengthIsEstimate: true };
    const result = calculatePhase(estimateProfile, [], new Date('2026-07-01'));
    expect(result.isApproximate).toBe(true);
  });

  it('does not flag isApproximate for a regular history even if the onboarding guess was uncertain', () => {
    const estimateProfile = { ...baseProfile, cycleLengthIsEstimate: true };
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
      { id: 3, startDate: '2026-05-27' },
    ];
    const result = calculatePhase(estimateProfile, history, new Date('2026-05-28'));
    expect(result.isApproximate).toBe(false);
  });
});

// Extracted so the notification scheduler can reuse the exact same boundaries
// calculatePhase uses, instead of its own hardcoded 28-day table.
describe('getPhaseBoundaries', () => {
  it('returns the reference boundaries for a 28-day / 5-day-period cycle', () => {
    expect(getPhaseBoundaries(baseProfile, [])).toEqual({
      menstrualEnd: 5,
      follicularEnd: 12,
      ovulatoryEnd: 15,
      cycleLength: 28,
    });
  });

  it('scales the later boundaries to a longer cycle', () => {
    expect(getPhaseBoundaries({ ...baseProfile, avgCycleLength: 32 }, [])).toEqual({
      menstrualEnd: 5,
      follicularEnd: 13,
      ovulatoryEnd: 17,
      cycleLength: 32,
    });
  });

  it('prefers the rolling average of the logged history over the onboarding guess', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-05-03' }, // 32-day gap
      { id: 3, startDate: '2026-06-04' }, // 32-day gap
    ];
    expect(getPhaseBoundaries(baseProfile, history).cycleLength).toBe(32);
  });

  it('agrees with the phase calculatePhase reports on the boundary days', () => {
    const boundaries = getPhaseBoundaries(baseProfile, []);
    const on = (day: number) =>
      calculatePhase(baseProfile, [], new Date(`2026-07-${String(day).padStart(2, '0')}`)).phase;

    expect(on(boundaries.menstrualEnd)).toBe('menstrual');
    expect(on(boundaries.menstrualEnd + 1)).toBe('follicular');
    expect(on(boundaries.follicularEnd)).toBe('follicular');
    expect(on(boundaries.follicularEnd + 1)).toBe('ovulatory');
    expect(on(boundaries.ovulatoryEnd)).toBe('ovulatory');
    expect(on(boundaries.ovulatoryEnd + 1)).toBe('luteal');
  });
});
