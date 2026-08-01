import { render, fireEvent, screen } from '@testing-library/react-native';
import { DietForm } from '@/components/onboarding/DietForm';

describe('DietForm', () => {
  it('submits an empty list when nothing is selected (omnivore)', () => {
    const onSubmit = jest.fn();
    render(<DietForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith([]);
  });

  it('submits the selected restrictions', () => {
    const onSubmit = jest.fn();
    render(<DietForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-vegetarian'));
    fireEvent.press(screen.getByTestId('option-gluten_free'));
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith(['vegetarian', 'gluten_free']);
  });

  it('toggles a selection off when pressed twice', () => {
    const onSubmit = jest.fn();
    render(<DietForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-vegetarian'));
    fireEvent.press(screen.getByTestId('option-vegetarian'));
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith([]);
  });
});
