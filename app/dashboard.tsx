import { View, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { PhaseCard } from '@/components/PhaseCard';
import { SymptomCheckIn } from '@/components/SymptomCheckIn';
import { PlateBuilder } from '@/components/PlateBuilder';
import { calculatePhase } from '@/engine/phaseEngine';
import { getRepositories } from '@/db/client';
import type { SymptomTag } from '@/types';

// Uses the UTC calendar date, matching how every other stored date (cycle
// starts, symptom logs) is produced — see subtractDaysUtc in
// CycleParamsForm.tsx. Accepted simplification: someone logging a symptom
// within a few hours of local midnight could see it land on the adjacent
// UTC day; not worth extra complexity for a first version.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardScreen() {
  const repos = getRepositories();
  const profile = repos.userProfile.get()!;
  const cycleHistory = repos.cycleEntry.getAll();
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomTag[]>([]);

  const phaseResult = useMemo(() => calculatePhase(profile, cycleHistory), [profile, cycleHistory]);

  function saveSymptoms() {
    repos.symptomLog.add(todayIso(), selectedSymptoms);
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhaseCard result={phaseResult} />
        <SymptomCheckIn selected={selectedSymptoms} onChange={setSelectedSymptoms} onSave={saveSymptoms} />
        <PlateBuilder phase={phaseResult.phase} symptoms={selectedSymptoms} />
      </View>
    </ScrollView>
  );
}
