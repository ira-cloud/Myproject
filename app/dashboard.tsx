import { View, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { PhaseCard } from '@/components/PhaseCard';
import { SymptomCheckIn } from '@/components/SymptomCheckIn';
import { PlateBuilder } from '@/components/PlateBuilder';
import { PatternInsight } from '@/components/PatternInsight';
import { calculatePhase } from '@/engine/phaseEngine';
import { findPatterns } from '@/engine/patternRecognition';
import { getRepositories } from '@/db/client';
import { scheduleNotifications } from '@/notifications/scheduler';
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

  const patterns = useMemo(
    () => findPatterns(repos.symptomLog.getAll(), cycleHistory, profile),
    [cycleHistory, profile]
  );

  useEffect(() => {
    scheduleNotifications(phaseResult);
  }, [phaseResult.cycleDay, phaseResult.phase, phaseResult.isApproximate]);

  function saveSymptoms() {
    repos.symptomLog.add(todayIso(), selectedSymptoms);
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhaseCard result={phaseResult} />
        <SymptomCheckIn selected={selectedSymptoms} onChange={setSelectedSymptoms} onSave={saveSymptoms} />
        <PlateBuilder phase={phaseResult.phase} symptoms={selectedSymptoms} />
        <PatternInsight patterns={patterns} />
      </View>
    </ScrollView>
  );
}
