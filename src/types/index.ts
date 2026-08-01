export type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type SymptomTag =
  | 'bloating'
  | 'breast_tenderness'
  | 'cramps'
  | 'acne'
  | 'apathy'
  | 'irritability'
  | 'anxiety'
  | 'sugar_craving'
  | 'salt_craving';

export type Intensity = 'light' | 'medium' | 'super';

export interface UserProfile {
  id: number;
  lastPeriodStart: string; // ISO date, e.g. "2026-07-20"
  avgCycleLength: number; // days
  avgPeriodLength: number; // days
  dietaryRestrictions: string[];
  intensity: Intensity;
  cycleLengthIsEstimate: boolean; // true if user picked "не уверена точно"
}

export interface CycleEntry {
  id: number;
  startDate: string; // ISO date
}

export interface SymptomLog {
  id: number;
  date: string; // ISO date
  tags: SymptomTag[];
}
