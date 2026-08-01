import { render, fireEvent, screen } from '@testing-library/react-native';
import { DisclaimerGate } from '@/components/DisclaimerGate';

describe('DisclaimerGate', () => {
  it('shows the disclaimer text', () => {
    render(<DisclaimerGate onAccept={() => {}} />);
    expect(screen.getByTestId('disclaimer-text')).toBeTruthy();
  });

  it('calls onAccept exactly once when the button is pressed', () => {
    const onAccept = jest.fn();
    render(<DisclaimerGate onAccept={onAccept} />);
    fireEvent.press(screen.getByTestId('accept-button'));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
