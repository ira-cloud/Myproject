import { render, screen } from '@testing-library/react-native';
import { PhaseCard } from '@/components/PhaseCard';

describe('PhaseCard', () => {
  it('shows the exact cycle day and phase name when not approximate', () => {
    render(<PhaseCard result={{ cycleDay: 21, phase: 'luteal', isApproximate: false }} />);
    expect(screen.getByText('День 21 · Лютеиновая фаза')).toBeTruthy();
  });

  it('shows an approximate label when isApproximate is true', () => {
    render(<PhaseCard result={{ cycleDay: 21, phase: 'luteal', isApproximate: true }} />);
    expect(screen.getByText('Ориентировочно лютеиновая фаза')).toBeTruthy();
  });

  it('renders the correct Russian name for each phase', () => {
    const { rerender } = render(<PhaseCard result={{ cycleDay: 1, phase: 'menstrual', isApproximate: false }} />);
    expect(screen.getByText('День 1 · Менструальная фаза')).toBeTruthy();

    rerender(<PhaseCard result={{ cycleDay: 8, phase: 'follicular', isApproximate: false }} />);
    expect(screen.getByText('День 8 · Фолликулярная фаза')).toBeTruthy();

    rerender(<PhaseCard result={{ cycleDay: 14, phase: 'ovulatory', isApproximate: false }} />);
    expect(screen.getByText('День 14 · Овуляторная фаза')).toBeTruthy();
  });
});
