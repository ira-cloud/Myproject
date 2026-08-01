import { View, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { PhaseCard } from '@/components/PhaseCard';
import { calculatePhase } from '@/engine/phaseEngine';
import { getRepositories } from '@/db/client';

export default function DashboardScreen() {
  const repos = getRepositories();
  const profile = repos.userProfile.get()!;
  const cycleHistory = repos.cycleEntry.getAll();

  const phaseResult = useMemo(() => calculatePhase(profile, cycleHistory), [profile, cycleHistory]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhaseCard result={phaseResult} />
      </View>
    </ScrollView>
  );
}
