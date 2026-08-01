import type { CycleEntry, Phase, UserProfile } from '@/types';

export interface PhaseResult {
  cycleDay: number;
  phase: Phase;
  isApproximate: boolean;
}

// Last cycle day belonging to each phase, plus the cycle length the boundaries
// were scaled to. Shared with the notification scheduler so "how many days
// until the next phase" is computed off the user's real cycle, not a fixed
// 28-day table.
export interface PhaseBoundaries {
  menstrualEnd: number;
  follicularEnd: number;
  ovulatoryEnd: number;
  cycleLength: number;
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

// Rolling-average gaps between the recent logged cycle starts. Empty until at
// least 3 entries exist, so the onboarding estimate keeps being used until
// there is enough real data to beat it.
function gapsFor(cycleHistory: CycleEntry[]): number[] {
  return cycleHistory.length >= 3 ? recentGaps(cycleHistory) : [];
}

function averageOf(gaps: number[]): number | null {
  return gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
}

export function getPhaseBoundaries(
  profile: UserProfile,
  cycleHistory: CycleEntry[]
): PhaseBoundaries {
  const cycleLength = averageOf(gapsFor(cycleHistory)) ?? profile.avgCycleLength;
  const menstrualEnd = profile.avgPeriodLength;
  const remaining = Math.max(cycleLength - menstrualEnd, 1);
  const follicularEnd = menstrualEnd + Math.round(remaining * REMAINING_PHASE_RATIOS.follicular);
  const ovulatoryEnd = follicularEnd + Math.round(remaining * REMAINING_PHASE_RATIOS.ovulatory);
  return { menstrualEnd, follicularEnd, ovulatoryEnd, cycleLength };
}

export function calculatePhase(
  profile: UserProfile,
  cycleHistory: CycleEntry[],
  today: Date = new Date()
): PhaseResult {
  const gaps = gapsFor(cycleHistory);
  const computedAvg = averageOf(gaps);
  const { menstrualEnd, follicularEnd, ovulatoryEnd, cycleLength: effectiveCycleLength } =
    getPhaseBoundaries(profile, cycleHistory);

  const sortedHistory = [...cycleHistory].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const mostRecentStart = sortedHistory[0]?.startDate ?? profile.lastPeriodStart;

  const daysSinceStart = daysBetween(new Date(mostRecentStart), today);
  const cycleDay =
    (((daysSinceStart % effectiveCycleLength) + effectiveCycleLength) % effectiveCycleLength) + 1;

  let phase: Phase;
  if (cycleDay <= menstrualEnd) phase = 'menstrual';
  else if (cycleDay <= follicularEnd) phase = 'follicular';
  else if (cycleDay <= ovulatoryEnd) phase = 'ovulatory';
  else phase = 'luteal';

  const isIrregular = gaps.length > 0 && Math.max(...gaps) - Math.min(...gaps) > 7;
  const isApproximate = isIrregular || (computedAvg === null && profile.cycleLengthIsEstimate);

  return { cycleDay, phase, isApproximate };
}
