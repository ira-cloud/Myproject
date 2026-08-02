import { render, fireEvent, screen } from '@testing-library/react-native';
import { CycleParamsForm } from '@/components/onboarding/CycleParamsForm';

describe('CycleParamsForm', () => {
  it('defaults to today, 28/5 days, and submits with cycleLengthIsEstimate=false', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      lastPeriodStart: '2026-07-25',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: false,
    });
  });

  it('submits the tapped calendar day within the current month', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('calendar-day-2026-07-22'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      lastPeriodStart: '2026-07-22',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: false,
    });
  });

  it('submits with cycleLengthIsEstimate=true when "не уверена точно" is selected', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('not-sure-toggle'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      lastPeriodStart: '2026-07-25',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: true,
    });
  });

  it('does not allow selecting a future date', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('calendar-day-2026-07-26'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ lastPeriodStart: '2026-07-25' })
    );
  });

  it('does not allow browsing into a future month', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('calendar-next-month'));

    // Still on July: the 26th (a real day in July) stays disabled/future,
    // proving the visible month never advanced past today's month.
    fireEvent.press(screen.getByTestId('calendar-day-2026-07-26'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ lastPeriodStart: '2026-07-25' })
    );
  });

  it('navigates to the previous month and selects a date there', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('calendar-prev-month'));
    fireEvent.press(screen.getByTestId('calendar-day-2026-06-15'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ lastPeriodStart: '2026-06-15' })
    );
  });
});
