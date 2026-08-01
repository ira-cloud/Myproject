import { router, useLocalSearchParams } from 'expo-router';
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
