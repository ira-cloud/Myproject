import { View, Text, Pressable } from 'react-native';

interface DisclaimerGateProps {
  onAccept: () => void;
}

const DISCLAIMER_TEXT =
  'Приложение носит исключительно информационный и ознакомительный характер и не является медицинской консультацией, диагностикой или назначением лечения. Всегда консультируйтесь с врачом перед изменением рациона.';

export function DisclaimerGate({ onAccept }: DisclaimerGateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-white">
      <Text className="text-lg font-semibold mb-4 text-center">Прежде чем начать</Text>
      <Text testID="disclaimer-text" className="text-base text-gray-700 mb-8 text-center">
        {DISCLAIMER_TEXT}
      </Text>
      <Pressable testID="accept-button" onPress={onAccept} className="bg-emerald-500 rounded-full px-8 py-3">
        <Text className="text-white font-semibold">Принять и продолжить</Text>
      </Pressable>
    </View>
  );
}
