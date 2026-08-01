import { View, Text, Pressable } from 'react-native';
import type { Intensity } from '@/types';

interface IntensityFormProps {
  onSubmit: (intensity: Intensity) => void;
}

const OPTIONS: { id: Intensity; label: string; hint: string }[] = [
  { id: 'light', label: '🐣 Light', hint: 'Сохранить привычки, минимизировать вред' },
  { id: 'medium', label: '🌿 Medium', hint: 'Мягкие постепенные замены' },
  { id: 'super', label: '⚡ Super', hint: 'Максимальная перестройка' },
];

export function IntensityForm({ onSubmit }: IntensityFormProps) {
  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-lg font-semibold mb-4">В каком темпе хочешь заботиться о себе?</Text>
      <View className="gap-3">
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            testID={`option-${opt.id}`}
            onPress={() => onSubmit(opt.id)}
            className="px-4 py-3 rounded-2xl bg-gray-100"
          >
            <Text className="font-semibold">{opt.label}</Text>
            <Text className="text-gray-600 text-sm">{opt.hint}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
