import * as Notifications from 'expo-notifications';
import { scheduleNotifications } from '@/notifications/scheduler';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

describe('scheduleNotifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cancels previously scheduled notifications before scheduling new ones', async () => {
    await scheduleNotifications({ cycleDay: 14, phase: 'ovulatory', isApproximate: false });
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });

  it('schedules an evening symptom check-in reminder for today', async () => {
    await scheduleNotifications({ cycleDay: 14, phase: 'ovulatory', isApproximate: false });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Как ты себя чувствуешь сегодня?' }),
      })
    );
  });

  it('schedules a phase-change reminder when the next phase is 2 days away', async () => {
    // day 14/28 with menstrual(5)/follicular(7)/ovulatory(3)->end 15, so day 14 is 1 day from luteal.
    // Use day 13 -> ovulatory ends day 15 -> 2 days out.
    await scheduleNotifications({ cycleDay: 13, phase: 'ovulatory', isApproximate: false });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Скоро смена фазы' }),
      })
    );
  });

  it('does not schedule a phase-change reminder when isApproximate is true', async () => {
    await scheduleNotifications({ cycleDay: 13, phase: 'ovulatory', isApproximate: true });
    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    const titles = calls.map((c) => c[0].content.title);
    expect(titles).not.toContain('Скоро смена фазы');
  });
});
