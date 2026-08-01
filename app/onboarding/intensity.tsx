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
    getRepositories().userProfile.save({
      lastPeriodStart: params.lastPeriodStart,
      avgCycleLength: Number(params.avgCycleLength),
      avgPeriodLength: Number(params.avgPeriodLength),
      dietaryRestrictions: JSON.parse(params.dietaryRestrictions),
      intensity,
      cycleLengthIsEstimate: params.cycleLengthIsEstimate === 'true',
    });
    router.replace('/dashboard');
  }
  return <IntensityForm onSubmit={handleSubmit} />;
}
