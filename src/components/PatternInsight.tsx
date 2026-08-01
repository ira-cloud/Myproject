import { View, Text } from 'react-native';
import type { SymptomPattern } from '@/engine/patternRecognition';
import type { SymptomTag } from '@/types';

interface PatternInsightProps {
  patterns: SymptomPattern[];
}

const TAG_LABELS: Record<SymptomTag, string> = {
  bloating: 'вздутие',
  breast_tenderness: 'болезненность груди',
  cramps: 'спазмы',
  acne: 'акне',
  apathy: 'апатию',
  irritability: 'раздражительность',
  anxiety: 'тревожность',
  sugar_craving: 'тягу к сладкому',
  salt_craving: 'тягу к солёному',
};

export function PatternInsight({ patterns }: PatternInsightProps) {
  if (patterns.length === 0) return null;

  return (
    <View testID="pattern-insight" className="bg-emerald-50 rounded-3xl p-4 mb-4">
      {patterns.map((p) => (
        <Text key={p.tag} className="text-sm text-gray-700">
          Похоже, {TAG_LABELS[p.tag]} у тебя чаще случается на {p.commonCycleDayRange[0]}–
          {p.commonCycleDayRange[1]} день цикла.
        </Text>
      ))}
    </View>
  );
}
