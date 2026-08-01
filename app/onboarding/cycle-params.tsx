import { router } from 'expo-router';
import { CycleParamsForm, type CycleParamsData } from '@/components/onboarding/CycleParamsForm';

export default function CycleParamsScreen() {
  // expo-router serializes route params to strings regardless of input type,
  // and every downstream screen (see intensity.tsx) reads them back as
  // strings — so we convert explicitly here instead of relying on a cast.
  function handleSubmit(data: CycleParamsData) {
    router.push({
      pathname: '/onboarding/diet',
      params: {
        lastPeriodStart: data.lastPeriodStart,
        avgCycleLength: String(data.avgCycleLength),
        avgPeriodLength: String(data.avgPeriodLength),
        cycleLengthIsEstimate: String(data.cycleLengthIsEstimate),
      },
    });
  }
  return <CycleParamsForm onSubmit={handleSubmit} />;
}
