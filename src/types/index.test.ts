import type { Phase } from '@/types';

describe('types smoke test', () => {
  it('accepts all four valid Phase values', () => {
    const phases: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    expect(phases).toHaveLength(4);
  });
});
