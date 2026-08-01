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

  it('shows a disclaimer under the nutrient recommendation', () => {
    render(<PlateBuilder phase="menstrual" symptoms={[]} />);
    expect(
      screen.getByText('Информация носит справочный характер. Не является медицинской рекомендацией.')
    ).toBeTruthy();
  });

  it('hides non-vegetarian proteins when the profile says вегетарианство', () => {
    render(<PlateBuilder phase="menstrual" symptoms={[]} dietaryRestrictions={['vegetarian']} />);
    expect(screen.getByTestId('option-lentils')).toBeTruthy();
    expect(screen.queryByTestId('option-beef_liver')).toBeNull();
    expect(screen.queryByTestId('option-salmon')).toBeNull();
  });

  it('still shows every protein when no dietary restrictions are given', () => {
    render(<PlateBuilder phase="menstrual" symptoms={[]} />);
    expect(screen.getByTestId('option-beef_liver')).toBeTruthy();
    expect(screen.getByTestId('option-salmon')).toBeTruthy();
  });
});
