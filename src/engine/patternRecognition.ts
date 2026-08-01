import type { CycleEntry, SymptomLog, SymptomTag, UserProfile } from '@/types';

export interface SymptomPattern {
  tag: SymptomTag;
  commonCycleDayRange: [number, number];
  occurrences: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const CLOSE_ENOUGH_SPAN = 2; // occurrences must fall within this many days of each other

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS);
}

// Unlike phaseEngine's calculatePhase (which always anchors on the single
// most recent cycle start, because it answers "what phase is it today?"),
// pattern recognition looks at *past* log dates and must anchor each one on
// whichever cycle was actually active on that date — not on a cycle that
// started later, which calculatePhase would otherwise pick.
function cycleDayFor(logDate: string, cycleHistory: CycleEntry[], profile: UserProfile): number {
  const priorStarts = cycleHistory
    .map((entry) => entry.startDate)
    .filter((start) => start <= logDate)
    .sort();
  const referenceStart = priorStarts[priorStarts.length - 1] ?? profile.lastPeriodStart;
  return daysBetween(new Date(referenceStart), new Date(logDate)) + 1;
}

export function findPatterns(
  logs: SymptomLog[],
  cycleHistory: CycleEntry[],
  profile: UserProfile
): SymptomPattern[] {
  if (cycleHistory.length < 2) return [];

  const dayByTag = new Map<SymptomTag, number[]>();
  for (const log of logs) {
    const cycleDay = cycleDayFor(log.date, cycleHistory, profile);
    for (const tag of log.tags) {
      const days = dayByTag.get(tag) ?? [];
      days.push(cycleDay);
      dayByTag.set(tag, days);
    }
  }

  const patterns: SymptomPattern[] = [];
  for (const [tag, days] of dayByTag) {
    if (days.length < 2) continue;
    const min = Math.min(...days);
    const max = Math.max(...days);
    if (max - min > CLOSE_ENOUGH_SPAN) continue;
    patterns.push({ tag, commonCycleDayRange: [min, max], occurrences: days.length });
  }
  return patterns;
}
