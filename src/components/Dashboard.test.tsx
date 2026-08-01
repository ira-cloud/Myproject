import { render, fireEvent, screen } from '@testing-library/react-native';
import { Dashboard } from '@/components/Dashboard';
import { createInMemoryStore } from '@/db/inMemoryStore';
import { createCycleEntryRepo } from '@/db/cycleEntryRepo';
import { createSymptomLogRepo, type LogRow } from '@/db/symptomLogRepo';
import { getRepositories } from '@/db/client';
import type { CycleEntry, UserProfile } from '@/types';

jest.mock('@/db/client', () => ({ getRepositories: jest.fn() }));
jest.mock('@/notifications/scheduler', () => ({ scheduleNotifications: jest.fn() }));

const profile: UserProfile = {
  id: 1,
  lastPeriodStart: '2026-07-01',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  dietaryRestrictions: [],
  intensity: 'medium',
  cycleLengthIsEstimate: false,
};

function setUpRepos() {
  const cycleEntry = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
  const symptomLog = createSymptomLogRepo(createInMemoryStore<LogRow>());
  (getRepositories as jest.Mock).mockReturnValue({ cycleEntry, symptomLog });
  return { cycleEntry, symptomLog };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

describe('Dashboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('writes a cycle entry for today when the user logs a new period start', () => {
    const { cycleEntry } = setUpRepos();
    render(<Dashboard profile={profile} />);

    fireEvent.press(screen.getByTestId('log-period-start-button'));

    expect(cycleEntry.getAll()).toEqual([{ id: 1, startDate: today() }]);
  });

  it('re-renders the phase card off the newly logged cycle start', () => {
    setUpRepos();
    render(<Dashboard profile={profile} />);

    fireEvent.press(screen.getByTestId('log-period-start-button'));

    // A period logged today makes today cycle day 1 regardless of what the
    // onboarding lastPeriodStart said — proof the recomputation actually ran.
    expect(screen.getByText(/^День 1 · /)).toBeTruthy();
  });

  it('saves the checked-in symptoms for today', () => {
    const { symptomLog } = setUpRepos();
    render(<Dashboard profile={profile} />);

    fireEvent.press(screen.getByTestId('tag-bloating'));
    fireEvent.press(screen.getByTestId('save-symptoms-button'));

    expect(symptomLog.getAll()).toEqual([{ id: 1, date: today(), tags: ['bloating'] }]);
  });

  it('does not create a second row when the user saves twice on the same day', () => {
    const { symptomLog } = setUpRepos();
    render(<Dashboard profile={profile} />);

    fireEvent.press(screen.getByTestId('tag-bloating'));
    fireEvent.press(screen.getByTestId('save-symptoms-button'));
    fireEvent.press(screen.getByTestId('tag-cramps'));
    fireEvent.press(screen.getByTestId('save-symptoms-button'));

    expect(symptomLog.getAll()).toHaveLength(1);
    expect(symptomLog.getAll()[0].tags).toEqual(['bloating', 'cramps']);
  });

  it('surfaces a pattern insight once a saved symptom lines up with the cycle history', () => {
    const { cycleEntry, symptomLog } = setUpRepos();
    // Two logged cycles (the minimum findPatterns needs) and one earlier
    // bloating log on cycle day 1 of the previous cycle.
    cycleEntry.add('2026-05-01');
    cycleEntry.add('2026-06-01');
    symptomLog.add('2026-05-01', ['bloating']);

    render(<Dashboard profile={profile} />);
    expect(screen.queryByTestId('pattern-insight')).toBeNull();

    // Logging a period start today, then bloating today, gives a second
    // occurrence on cycle day 1 — the insight has to appear without a reload.
    fireEvent.press(screen.getByTestId('log-period-start-button'));
    fireEvent.press(screen.getByTestId('tag-bloating'));
    fireEvent.press(screen.getByTestId('save-symptoms-button'));

    expect(screen.getByTestId('pattern-insight')).toBeTruthy();
    expect(screen.getByText(/вздутие/)).toBeTruthy();
  });

  it('filters the protein options down to vegetarian ones for a vegetarian profile', () => {
    setUpRepos();
    render(<Dashboard profile={{ ...profile, dietaryRestrictions: ['vegetarian'] }} />);

    fireEvent.press(screen.getByTestId('log-period-start-button')); // day 1 -> menstrual
    expect(screen.getByTestId('option-lentils')).toBeTruthy();
    expect(screen.queryByTestId('option-beef_liver')).toBeNull();
  });
});
