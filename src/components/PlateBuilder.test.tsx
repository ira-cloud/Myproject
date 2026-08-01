import { render, fireEvent, screen } from '@testing-library/react-native';
import { PlateBuilder } from '@/components/PlateBuilder';

describe('PlateBuilder', () => {
  it('shows the focus nutrients and explanation for the given phase', () => {
    render(<PlateBuilder phase="luteal" symptoms={[]} />);
    expect(screen.getByText('Магний, B6')).toBeTruthy();
  });

  it('shows a symptom note when a relevant symptom is passed', () => {
    render(<PlateBuilder phase="luteal" symptoms={['sugar_craving']} />);
    expect(
      screen.getByText('Тяга к сладкому сегодня — это реакция мозга на расход магния, а не слабость воли.')
    ).toBeTruthy();
  });

  it('lets the user pick one equivalent option per category, highlighting the choice', () => {
    render(<PlateBuilder phase="luteal" symptoms={[]} />);
    const option = screen.getByTestId('option-turkey');
    fireEvent.press(option);
    expect(option.props.accessibilityState.selected).toBe(true);
  });

  it('renders all four categories', () => {
    render(<PlateBuilder phase="menstrual" symptoms={[]} />);
    expect(screen.getByTestId('category-protein')).toBeTruthy();
    expect(screen.getByTestId('category-carbs')).toBeTruthy();
    expect(screen.getByTestId('category-fats')).toBeTruthy();
    expect(screen.getByTestId('category-tea_spice')).toBeTruthy();
  });
});
