import { View, Text, Pressable } from 'react-native';
import type { SymptomTag } from '@/types';

interface SymptomCheckInProps {
  selected: SymptomTag[];
  onChange: (tags: SymptomTag[]) => void;
  onSave: () => void;
}

const TAGS: { id: SymptomTag; label: string }[] = [
  { id: 'bloating', label: '🎈 Вздутие' },
  { id: 'breast_tenderness', label: '💔 Болезненность груди' },
  { id: 'cramps', label: '😣 Спазмы' },
  { id: 'acne', label: '🔴 Акне' },
  { id: 'apathy', label: '😶 Апатия' },
  { id: 'irritability', label: '😤 Раздражительность' },
  { id: 'anxiety', label: '😰 Тревожность' },
  { id: 'sugar_craving', label: '🍬 Тяга к сладкому' },
  { id: 'salt_craving', label: '🧂 Тяга к солёному' },
];

export function SymptomCheckIn({ selected, onChange, onSave }: SymptomCheckInProps) {
  function toggle(tag: SymptomTag) {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }

  return (
    <View className="bg-gray-50 rounded-3xl p-4 mb-4">
      <Text className="text-base font-semibold mb-3">Как ты себя чувствуешь сегодня?</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {TAGS.map((tag) => (
          <Pressable
            key={tag.id}
            testID={`tag-${tag.id}`}
            onPress={() => toggle(tag.id)}
            className={`px-3 py-2 rounded-full ${selected.includes(tag.id) ? 'bg-emerald-500' : 'bg-white'}`}
          >
            <Text className={selected.includes(tag.id) ? 'text-white' : 'text-gray-700'}>{tag.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable testID="save-symptoms-button" onPress={onSave} className="bg-emerald-500 rounded-full px-6 py-2 self-start">
        <Text className="text-white font-semibold">Сохранить</Text>
      </Pressable>
    </View>
  );
}
