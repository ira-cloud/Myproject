import type { CycleEntry, Phase, UserProfile } from '@/types';

export interface PhaseResult {
  cycleDay: number;
  phase: Phase;
  isApproximate: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
// Share of the non-menstrual portion of a default 28-day/5-day-period cycle
// (23 remaining days) occupied by each later phase — used to scale phase
// boundaries proportionally when the user's real cycle length differs.
const REMAINING_PHASE_RATIOS = { follicular: 7 / 23, ovulatory: 3 / 23 };

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS);
}

function recentGaps(history: CycleEntry[]): number[] {
  const sorted = [...history].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const recent = sorted.slice(-6);
  const gaps: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    gaps.push(daysBetween(new Date(recent[i - 1].startDate), new Date(recent[i].startDate)));
  }
  return gaps;
}

export function calculatePhase(
  profile: UserProfile,
  cycleHistory: CycleEntry[],
  today: Date = new Date()
): PhaseResult {
  const gaps = cycleHistory.length >= 3 ? recentGaps(cycleHistory) : [];
  const computedAvg =
    gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
  const effectiveCycleLength = computedAvg ?? profile.avgCycleLength;

  const sortedHistory = [...cycleHistory].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const mostRecentStart = sortedHistory[0]?.startDate ?? profile.lastPeriodStart;

  const daysSinceStart = daysBetween(new Date(mostRecentStart), today);
  const cycleDay =
    (((daysSinceStart % effectiveCycleLength) + effectiveCycleLength) % effectiveCycleLength) + 1;

  const menstrualEnd = profile.avgPeriodLength;
  const remaining = Math.max(effectiveCycleLength - menstrualEnd, 1);
  const follicularEnd = menstrualEnd + Math.round(remaining * REMAINING_PHASE_RATIOS.follicular);
  const ovulatoryEnd = follicularEnd + Math.round(remaining * REMAINING_PHASE_RATIOS.ovulatory);

  let phase: Phase;
  if (cycleDay <= menstrualEnd) phase = 'menstrual';
  else if (cycleDay <= follicularEnd) phase = 'follicular';
  else if (cycleDay <= ovulatoryEnd) phase = 'ovulatory';
  else phase = 'luteal';

  const isIrregular = gaps.length > 0 && Math.max(...gaps) - Math.min(...gaps) > 7;
  const isApproximate = isIrregular || (computedAvg === null && profile.cycleLengthIsEstimate);

  return { cycleDay, phase, isApproximate };
}
