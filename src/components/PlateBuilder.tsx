import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getRecommendation } from '@/content/rulesEngine';
import type { Phase, SymptomTag } from '@/types';
import type { FoodCategoryKey } from '@/content/knowledgeBase';

interface PlateBuilderProps {
  phase: Phase;
  symptoms: SymptomTag[];
}

const CATEGORY_LABELS: Record<FoodCategoryKey, string> = {
  protein: 'Белок',
  carbs: 'Сложные углеводы',
  fats: 'Полезные жиры',
  tea_spice: 'Чай / специя',
};

export function PlateBuilder({ phase, symptoms }: PlateBuilderProps) {
  const recommendation = getRecommendation(phase, symptoms);
  const [choices, setChoices] = useState<Record<string, string>>({});

  return (
    <View className="bg-orange-50 rounded-3xl p-4 mb-4">
      <Text className="text-base font-semibold mb-1">Тарелка дня</Text>
      <Text className="text-sm text-gray-600 mb-1">{recommendation.focusNutrients.join(', ')}</Text>
      <Text className="text-sm text-gray-700 mb-3">{recommendation.explanation}</Text>

      {recommendation.symptomNotes.map((note) => (
        <Text key={note} className="text-sm text-emerald-700 mb-3">
          {note}
        </Text>
      ))}

      {recommendation.categories.map(({ key, options }) => (
        <View key={key} testID={`category-${key}`} className="mb-4">
          <Text className="text-sm font-semibold text-gray-600 mb-2">{CATEGORY_LABELS[key]}</Text>
          <View className="flex-row flex-wrap items-center gap-2">
            {options.map((opt, i) => (
              <View key={opt.id} className="flex-row items-center gap-2">
                <Pressable
                  testID={`option-${opt.id}`}
                  accessibilityState={{ selected: choices[key] === opt.id }}
                  onPress={() => setChoices((prev) => ({ ...prev, [key]: opt.id }))}
                  className={`px-3 py-2 rounded-full ${choices[key] === opt.id ? 'bg-emerald-500' : 'bg-white'}`}
                >
                  <Text className={choices[key] === opt.id ? 'text-white' : 'text-gray-700'}>
                    {opt.emoji} {opt.name}
                  </Text>
                </Pressable>
                {i < options.length - 1 && <Text className="text-gray-400">⇄</Text>}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
