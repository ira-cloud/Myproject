import { render, fireEvent, screen } from '@testing-library/react-native';
import { CycleParamsForm } from '@/components/onboarding/CycleParamsForm';

describe('CycleParamsForm', () => {
  it('defaults to 28/5 days and submits with cycleLengthIsEstimate=false when the user enters real numbers', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('days-since-start-3'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      lastPeriodStart: '2026-07-22',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: false,
    });
  });

  it('submits with cycleLengthIsEstimate=true and the 28/5 defaults when "не уверена точно" is selected', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('days-since-start-0'));
    fireEvent.press(screen.getByTestId('not-sure-toggle'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      lastPeriodStart: '2026-07-25',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: true,
    });
  });
});
