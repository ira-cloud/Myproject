import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function toIsoDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// Monday-first weekday index (0=Mon..6=Sun) for the 1st of the given UTC
// month — keeps the whole calendar on the same UTC convention as every
// other date in this app (see subtractDaysUtc's comment, previously here).
function mondayFirstWeekday(year: number, month: number, day: number): number {
  const jsDay = new Date(Date.UTC(year, month, day)).getUTCDay(); // 0=Sun..6=Sat
  return (jsDay + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function CycleParamsForm({ onSubmit, today = new Date() }: CycleParamsFormProps) {
  const todayIso = today.toISOString().slice(0, 10);
  const todayYear = today.getUTCFullYear();
  const todayMonth = today.getUTCMonth();

  const [visibleYear, setVisibleYear] = useState(todayYear);
  const [visibleMonth, setVisibleMonth] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [notSure, setNotSure] = useState(false);

  const isCurrentMonth = visibleYear === todayYear && visibleMonth === todayMonth;

  function goToPrevMonth() {
    if (visibleMonth === 0) {
      setVisibleYear((y) => y - 1);
      setVisibleMonth(11);
    } else {
      setVisibleMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (isCurrentMonth) return; // can't browse into the future
    if (visibleMonth === 11) {
      setVisibleYear((y) => y + 1);
      setVisibleMonth(0);
    } else {
      setVisibleMonth((m) => m + 1);
    }
  }

  const totalDays = daysInMonth(visibleYear, visibleMonth);
  const leadingBlanks = mondayFirstWeekday(visibleYear, visibleMonth, 1);
  const dayCells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  function handleSubmit() {
    onSubmit({
      lastPeriodStart: selectedDate,
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: notSure,
    });
  }

  return (
    <SafeAreaView className="flex-1 p-6 bg-white">
      <Text className="text-lg font-semibold mb-4">Когда начались последние месячные?</Text>

      <View className="flex-row items-center justify-between mb-3">
        <Pressable testID="calendar-prev-month" onPress={goToPrevMonth} className="px-3 py-2">
          <Text className="text-emerald-600 text-lg">‹</Text>
        </Pressable>
        <Text className="font-semibold">
          {MONTH_LABELS[visibleMonth]} {visibleYear}
        </Text>
        <Pressable
          testID="calendar-next-month"
          onPress={goToNextMonth}
          disabled={isCurrentMonth}
          className="px-3 py-2"
        >
          <Text className={isCurrentMonth ? 'text-gray-300 text-lg' : 'text-emerald-600 text-lg'}>›</Text>
        </Pressable>
      </View>

      <View className="flex-row mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center">
            <Text className="text-xs text-gray-400">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap mb-6">
        {dayCells.map((day, i) => {
          if (day === null) {
            return <View key={`blank-${i}`} style={{ width: '14.28%' }} className="py-1" />;
          }
          const iso = toIsoDate(visibleYear, visibleMonth, day);
          const isFuture = iso > todayIso;
          const isSelected = iso === selectedDate;
          return (
            <View key={iso} style={{ width: '14.28%' }} className="py-1 items-center">
              <Pressable
                testID={`calendar-day-${iso}`}
                disabled={isFuture}
                onPress={() => setSelectedDate(iso)}
                className={`w-9 h-9 items-center justify-center rounded-full ${
                  isSelected ? 'bg-emerald-500' : ''
                }`}
              >
                <Text
                  className={
                    isSelected ? 'text-white font-semibold' : isFuture ? 'text-gray-300' : 'text-gray-700'
                  }
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable
        testID="not-sure-toggle"
        onPress={() => setNotSure((v) => !v)}
        className={`px-4 py-2 rounded-full self-start mb-8 ${notSure ? 'bg-emerald-500' : 'bg-gray-100'}`}
      >
        <Text className={notSure ? 'text-white' : 'text-gray-700'}>Не уверена точно</Text>
      </Pressable>

      <Pressable
        testID="submit-button"
        onPress={handleSubmit}
        className="bg-emerald-500 rounded-full px-8 py-3 self-start"
      >
        <Text className="text-white font-semibold">Далее</Text>
      </Pressable>
    </SafeAreaView>
  );
}
