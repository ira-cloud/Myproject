import * as Notifications from 'expo-notifications';
import type { PhaseResult } from '@/engine/phaseEngine';

// Phase boundaries at the reference 28-day/5-day-period cycle used only to
// estimate "how many days until the next phase" for the reminder — the real
// phase itself always comes from phaseEngine, this is a display heuristic only.
const REFERENCE_PHASE_END_DAY: Record<PhaseResult['phase'], number> = {
  menstrual: 5,
  follicular: 12,
  ovulatory: 15,
  luteal: 28,
};

function daysUntilNextPhase(result: PhaseResult): number {
  return REFERENCE_PHASE_END_DAY[result.phase] - result.cycleDay;
}

function atHour(hour: number, daysFromNow = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export async function scheduleNotifications(result: PhaseResult): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Как ты себя чувствуешь сегодня?',
      body: 'Отметь симптомы дня — мы подстроим тарелку под них.',
    },
    trigger: atHour(20),
  });

  if (!result.isApproximate && daysUntilNextPhase(result) === 2) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Скоро смена фазы',
        body: 'Через 2 дня начинается новая фаза — загляни, чем закупиться на неделю.',
      },
      trigger: atHour(9),
    });
  }
}
