import { render, screen } from '@testing-library/react-native';
import { PatternInsight } from '@/components/PatternInsight';

describe('PatternInsight', () => {
  it('renders nothing when there are no patterns', () => {
    render(<PatternInsight patterns={[]} />);
    expect(screen.queryByTestId('pattern-insight')).toBeNull();
  });

  it('shows a gentle observation, not a diagnosis, for a bloating pattern', () => {
    render(
      <PatternInsight
        patterns={[{ tag: 'bloating', commonCycleDayRange: [20, 22], occurrences: 2 }]}
      />
    );
    expect(
      screen.getByText('Похоже, вздутие у тебя чаще случается на 20–22 день цикла.')
    ).toBeTruthy();
  });
});
