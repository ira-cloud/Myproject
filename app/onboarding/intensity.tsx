import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { IntensityForm } from '@/components/onboarding/IntensityForm';
import { getRepositories } from '@/db/client';
import type { Intensity } from '@/types';

export default function IntensityScreen() {
  const params = useLocalSearchParams<{
    lastPeriodStart: string;
    avgCycleLength: string;
    avgPeriodLength: string;
    cycleLengthIsEstimate: string;
    dietaryRestrictions: string;
  }>();

  // Route params can arrive empty if this screen is reached any way other
  // than pushing through cycle-params -> diet in order (e.g. a stale deep
  // link, or a dev Fast Refresh mid-flow) — bounce back to the start of
  // onboarding instead of saving a profile with a missing required field.
  if (!params.lastPeriodStart || !params.avgCycleLength || !params.avgPeriodLength) {
    return <Redirect href="/onboarding/cycle-params" />;
  }

  function handleSubmit(intensity: Intensity) {
    const repos = getRepositories();
    repos.userProfile.save({
      lastPeriodStart: params.lastPeriodStart,
      avgCycleLength: Number(params.avgCycleLength),
      avgPeriodLength: Number(params.avgPeriodLength),
      dietaryRestrictions: JSON.parse(params.dietaryRestrictions),
      intensity,
      cycleLengthIsEstimate: params.cycleLengthIsEstimate === 'true',
    });
    // Seed the first real cycle_entry row from the date the user just gave us.
    // Without it the cycle_entry table stays empty forever, and the rolling
    // average / irregular-cycle detection (3+ entries) and pattern recognition
    // (2+ entries) can never turn on.
    if (repos.cycleEntry.getAll().length === 0) {
      repos.cycleEntry.add(params.lastPeriodStart);
    }
    router.replace('/dashboard');
  }
  return <IntensityForm onSubmit={handleSubmit} />;
}
