import { router } from 'expo-router';
import { DisclaimerGate } from '@/components/DisclaimerGate';
import { getRepositories } from '@/db/client';

export default function DisclaimerScreen() {
  return (
    <DisclaimerGate
      onAccept={() => {
        getRepositories().settings.setBool('disclaimer_accepted', true);
        router.replace('/onboarding/cycle-params');
      }}
    />
  );
}
