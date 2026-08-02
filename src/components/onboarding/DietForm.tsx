import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DietFormProps {
  onSubmit: (restrictions: string[]) => void;
}

const OPTIONS: { id: string; label: string }[] = [
  { id: 'vegetarian', label: 'Вегетарианство' },
  { id: 'gluten_free', label: 'Без глютена' },
  { id: 'dairy_free', label: 'Без молочных продуктов' },
];

export function DietForm({ onSubmit }: DietFormProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <SafeAreaView className="flex-1 p-6 bg-white">
      <Text className="text-lg font-semibold mb-4">Есть ли пищевые ограничения?</Text>
      <View className="gap-2 mb-8">
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            testID={`option-${opt.id}`}
            onPress={() => toggle(opt.id)}
            className={`px-4 py-2 rounded-full self-start ${selected.includes(opt.id) ? 'bg-emerald-500' : 'bg-gray-100'}`}
          >
            <Text className={selected.includes(opt.id) ? 'text-white' : 'text-gray-700'}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable testID="submit-button" onPress={() => onSubmit(selected)} className="bg-emerald-500 rounded-full px-8 py-3 self-start">
        <Text className="text-white font-semibold">Далее</Text>
      </Pressable>
    </SafeAreaView>
  );
}
