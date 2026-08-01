import * as Notifications from 'expo-notifications';
import { getPhaseBoundaries, type PhaseResult } from '@/engine/phaseEngine';
import type { CycleEntry, Phase, UserProfile } from '@/types';

const CHECK_IN_HOUR = 20;
const PHASE_CHANGE_HOUR = 9;
const PHASE_CHANGE_LEAD_DAYS = 2;

// Last cycle day of the user's current phase, scaled to her real cycle length
// by the same code calculatePhase uses. A fixed 28-day table put the reminder
// on the wrong day (or, since the check is an exact match, never fired at all)
// for anyone whose cycle is not exactly 28 days with a 5-day period.
function daysUntilNextPhase(
  result: PhaseResult,
  profile: UserProfile,
  cycleHistory: CycleEntry[]
): number {
  const boundaries = getPhaseBoundaries(profile, cycleHistory);
  const endDay: Record<Phase, number> = {
    menstrual: boundaries.menstrualEnd,
    follicular: boundaries.follicularEnd,
    ovulatory: boundaries.ovulatoryEnd,
    luteal: boundaries.cycleLength,
  };
  return endDay[result.phase] - result.cycleDay;
}

function atHour(hour: number, daysFromNow = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export async function scheduleNotifications(
  result: PhaseResult,
  profile: UserProfile,
  cycleHistory: CycleEntry[]
): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  // Repeating daily trigger rather than a one-shot "today at 20:00" Date:
  // scheduling only runs while the dashboard is mounted, so a one-shot trigger
  // silently skipped every day the user did not open the app — and did nothing
  // at all when the app was opened after 20:00.
  const dailyCheckIn: Notifications.DailyTriggerInput = {
    hour: CHECK_IN_HOUR,
    minute: 0,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Как ты себя чувствуешь сегодня?',
      body: 'Отметь симптомы дня — мы подстроим тарелку под них.',
    },
    trigger: dailyCheckIn,
  });

  if (
    !result.isApproximate &&
    daysUntilNextPhase(result, profile, cycleHistory) === PHASE_CHANGE_LEAD_DAYS
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Скоро смена фазы',
        body: 'Через 2 дня начинается новая фаза — загляни, чем закупиться на неделю.',
      },
      trigger: atHour(PHASE_CHANGE_HOUR),
    });
  }
}
