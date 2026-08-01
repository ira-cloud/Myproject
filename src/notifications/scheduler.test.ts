import * as Notifications from 'expo-notifications';
import { scheduleNotifications } from '@/notifications/scheduler';
import type { UserProfile } from '@/types';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

const profile28: UserProfile = {
  id: 1,
  lastPeriodStart: '2026-07-01',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  dietaryRestrictions: [],
  intensity: 'medium',
  cycleLengthIsEstimate: false,
};

function scheduledTitles(): string[] {
  return (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
    (call) => call[0].content.title
  );
}

describe('scheduleNotifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cancels previously scheduled notifications before scheduling new ones', async () => {
    await scheduleNotifications(
      { cycleDay: 14, phase: 'ovulatory', isApproximate: false },
      profile28,
      []
    );
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });

  it('schedules the evening symptom check-in on a repeating daily trigger, not a one-shot date', async () => {
    await scheduleNotifications(
      { cycleDay: 14, phase: 'ovulatory', isApproximate: false },
      profile28,
      []
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Как ты себя чувствуешь сегодня?' }),
        trigger: { hour: 20, minute: 0, repeats: true },
      })
    );
  });

  it('schedules a phase-change reminder when the next phase is 2 days away', async () => {
    // 28-day cycle, 5-day period -> ovulatory ends on day 15, so day 13 is 2 days out.
    await scheduleNotifications(
      { cycleDay: 13, phase: 'ovulatory', isApproximate: false },
      profile28,
      []
    );
    expect(scheduledTitles()).toContain('Скоро смена фазы');
  });

  it('uses the boundaries of the real cycle length, not a hardcoded 28-day table', async () => {
    // 32-day cycle, 5-day period: remaining = 27, follicular ends on
    // 5 + round(27 * 7/23) = 5 + 8 = 13, ovulatory on 13 + round(27 * 3/23) = 13 + 4 = 17.
    // So the reminder belongs on day 15 — the old hardcoded table fired on day 13.
    const profile32: UserProfile = { ...profile28, avgCycleLength: 32 };

    await scheduleNotifications(
      { cycleDay: 15, phase: 'ovulatory', isApproximate: false },
      profile32,
      []
    );
    expect(scheduledTitles()).toContain('Скоро смена фазы');

    jest.clearAllMocks();
    await scheduleNotifications(
      { cycleDay: 13, phase: 'ovulatory', isApproximate: false },
      profile32,
      []
    );
    expect(scheduledTitles()).not.toContain('Скоро смена фазы');
  });

  it('takes the boundaries from the logged cycle history once it overrides the onboarding guess', async () => {
    // Three logged 32-day cycles beat the profile's 28-day guess, so the
    // boundaries must match the 32-day case above rather than the profile.
    const history = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-05-03' },
      { id: 3, startDate: '2026-06-04' },
    ];
    await scheduleNotifications(
      { cycleDay: 15, phase: 'ovulatory', isApproximate: false },
      profile28,
      history
    );
    expect(scheduledTitles()).toContain('Скоро смена фазы');
  });

  it('does not schedule a phase-change reminder when isApproximate is true', async () => {
    await scheduleNotifications(
      { cycleDay: 13, phase: 'ovulatory', isApproximate: true },
      profile28,
      []
    );
    expect(scheduledTitles()).not.toContain('Скоро смена фазы');
  });

  it('returns early without scheduling when notification permissions are denied', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    await scheduleNotifications(
      { cycleDay: 14, phase: 'ovulatory', isApproximate: false },
      profile28,
      []
    );
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });
});
