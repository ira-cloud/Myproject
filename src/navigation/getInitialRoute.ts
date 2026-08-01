export type Route = '/onboarding/disclaimer' | '/onboarding/cycle-params' | '/dashboard';

export function getInitialRoute(disclaimerAccepted: boolean, hasProfile: boolean): Route {
  if (!disclaimerAccepted) return '/onboarding/disclaimer';
  if (!hasProfile) return '/onboarding/cycle-params';
  return '/dashboard';
}
