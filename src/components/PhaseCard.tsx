import { View, Text } from 'react-native';
import type { PhaseResult } from '@/engine/phaseEngine';
import type { Phase } from '@/types';

interface PhaseCardProps {
  result: PhaseResult;
}

const PHASE_NAMES: Record<Phase, string> = {
  menstrual: 'Менструальная фаза',
  follicular: 'Фолликулярная фаза',
  ovulatory: 'Овуляторная фаза',
  luteal: 'Лютеиновая фаза',
};

export function PhaseCard({ result }: PhaseCardProps) {
  const label = result.isApproximate
    ? `Ориентировочно ${PHASE_NAMES[result.phase].toLowerCase()}`
    : `День ${result.cycleDay} · ${PHASE_NAMES[result.phase]}`;

  return (
    <View className="bg-gradient-to-br from-emerald-100 to-orange-100 rounded-3xl p-6 mb-4">
      <Text className="text-xl font-semibold text-gray-800">{label}</Text>
    </View>
  );
}
