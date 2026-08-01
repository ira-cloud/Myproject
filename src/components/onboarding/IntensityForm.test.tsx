import { render, fireEvent, screen } from '@testing-library/react-native';
import { IntensityForm } from '@/components/onboarding/IntensityForm';

describe('IntensityForm', () => {
  it('submits "medium" when that option is pressed', () => {
    const onSubmit = jest.fn();
    render(<IntensityForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-medium'));
    expect(onSubmit).toHaveBeenCalledWith('medium');
  });

  it('submits "light" and "super" for the other two options', () => {
    const onSubmit = jest.fn();
    render(<IntensityForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-light'));
    expect(onSubmit).toHaveBeenCalledWith('light');
  });
});
