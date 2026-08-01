import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export interface CycleParamsData {
  lastPeriodStart: string;
  avgCycleLength: number;
  avgPeriodLength: number;
  cycleLengthIsEstimate: boolean;
}

interface CycleParamsFormProps {
  onSubmit: (data: CycleParamsData) => void;
  today?: Date;
}

const DAYS_SINCE_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Subtracts whole days using epoch milliseconds rather than
// Date.setDate()/getDate() (which operate in the device's local timezone).
// Mixing that with the UTC-based toISOString() below can shift the computed
// date by a day depending on the device's timezone offset — this keeps the
// whole calculation consistently UTC-based instead.
function subtractDaysUtc(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_MS);
}

export function CycleParamsForm({ onSubmit, today = new Date() }: CycleParamsFormProps) {
  const [daysSince, setDaysSince] = useState(0);
  const [notSure, setNotSure] = useState(false);

  function handleSubmit() {
    const start = subtractDaysUtc(today, daysSince);
    onSubmit({
      lastPeriodStart: toIsoDate(start),
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: notSure,
    });
  }

  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-lg font-semibold mb-4">Когда начались последние месячные?</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {DAYS_SINCE_OPTIONS.map((n) => (
          <Pressable
            key={n}
            testID={`days-since-start-${n}`}
            onPress={() => setDaysSince(n)}
            className={`px-4 py-2 rounded-full ${daysSince === n ? 'bg-emerald-500' : 'bg-gray-100'}`}
          >
            <Text className={daysSince === n ? 'text-white' : 'text-gray-700'}>
              {n === 0 ? 'Сегодня' : `${n} дн. назад`}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        testID="not-sure-toggle"
        onPress={() => setNotSure((v) => !v)}
        className={`px-4 py-2 rounded-full self-start mb-8 ${notSure ? 'bg-emerald-500' : 'bg-gray-100'}`}
      >
        <Text className={notSure ? 'text-white' : 'text-gray-700'}>Не уверена точно</Text>
      </Pressable>
      <Pressable testID="submit-button" onPress={handleSubmit} className="bg-emerald-500 rounded-full px-8 py-3 self-start">
        <Text className="text-white font-semibold">Далее</Text>
      </Pressable>
    </View>
  );
}
