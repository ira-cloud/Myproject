import { View, Text, Pressable, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { PhaseCard } from '@/components/PhaseCard';
import { SymptomCheckIn } from '@/components/SymptomCheckIn';
import { PlateBuilder } from '@/components/PlateBuilder';
import { PatternInsight } from '@/components/PatternInsight';
import { calculatePhase } from '@/engine/phaseEngine';
import { findPatterns } from '@/engine/patternRecognition';
import { getRepositories } from '@/db/client';
import { scheduleNotifications } from '@/notifications/scheduler';
import type { CycleEntry, SymptomLog, SymptomTag, UserProfile } from '@/types';

interface DashboardProps {
  profile: UserProfile;
}

// Uses the UTC calendar date, matching how every other stored date (cycle
// starts, symptom logs) is produced — see subtractDaysUtc in
// CycleParamsForm.tsx. Accepted simplification: someone logging a symptom
// within a few hours of local midnight could see it land on the adjacent
// UTC day; not worth extra complexity for a first version.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function Dashboard({ profile }: DashboardProps) {
  const repos = getRepositories();
  // Both tables are held in state, not re-read inline on every render: writing
  // a cycle entry or a symptom log has to visibly change the phase card and the
  // pattern insight, and the useMemo dependency arrays below can only be honest
  // if these references are stable between writes.
  const [cycleHistory, setCycleHistory] = useState<CycleEntry[]>(() => repos.cycleEntry.getAll());
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => repos.symptomLog.getAll());
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomTag[]>([]);

  const phaseResult = useMemo(() => calculatePhase(profile, cycleHistory), [profile, cycleHistory]);

  const patterns = useMemo(
    () => findPatterns(symptomLogs, cycleHistory, profile),
    [symptomLogs, cycleHistory, profile]
  );

  useEffect(() => {
    scheduleNotifications(phaseResult, profile, cycleHistory);
  }, [phaseResult, profile, cycleHistory]);

  function saveSymptoms() {
    repos.symptomLog.addOrReplace(todayIso(), selectedSymptoms);
    setSymptomLogs(repos.symptomLog.getAll());
  }

  function logPeriodStart() {
    repos.cycleEntry.add(todayIso());
    setCycleHistory(repos.cycleEntry.getAll());
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhaseCard result={phaseResult} />
        <Pressable
          testID="log-period-start-button"
          onPress={logPeriodStart}
          className="bg-rose-500 rounded-full px-6 py-2 self-start mb-4"
        >
          <Text className="text-white font-semibold">Месячные начались сегодня</Text>
        </Pressable>
        <SymptomCheckIn
          selected={selectedSymptoms}
          onChange={setSelectedSymptoms}
          onSave={saveSymptoms}
        />
        <PlateBuilder
          phase={phaseResult.phase}
          symptoms={selectedSymptoms}
          dietaryRestrictions={profile.dietaryRestrictions}
        />
        <PatternInsight patterns={patterns} />
      </View>
    </ScrollView>
  );
}
