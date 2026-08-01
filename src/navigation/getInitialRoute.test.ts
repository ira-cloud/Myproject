import { getInitialRoute } from '@/navigation/getInitialRoute';

describe('getInitialRoute', () => {
  it('routes to the disclaimer screen first if not yet accepted', () => {
    expect(getInitialRoute(false, false)).toBe('/onboarding/disclaimer');
    expect(getInitialRoute(false, true)).toBe('/onboarding/disclaimer');
  });

  it('routes to cycle-params if disclaimer accepted but no profile saved', () => {
    expect(getInitialRoute(true, false)).toBe('/onboarding/cycle-params');
  });

  it('routes straight to the dashboard once both are done', () => {
    expect(getInitialRoute(true, true)).toBe('/dashboard');
  });
});
