import { router, useLocalSearchParams } from 'expo-router';
import { DietForm } from '@/components/onboarding/DietForm';

export default function DietScreen() {
  const params = useLocalSearchParams();
  function handleSubmit(dietaryRestrictions: string[]) {
    router.push({ pathname: '/onboarding/intensity', params: { ...params, dietaryRestrictions: JSON.stringify(dietaryRestrictions) } });
  }
  return <DietForm onSubmit={handleSubmit} />;
}
