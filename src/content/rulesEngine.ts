import type { Phase, SymptomTag } from '@/types';
import { KNOWLEDGE_BASE, SYMPTOM_NOTES, type FoodCategoryKey, type FoodOption } from '@/content/knowledgeBase';

export interface PlateRecommendation {
  focusNutrients: string[];
  explanation: string;
  symptomNotes: string[];
  categories: { key: FoodCategoryKey; options: FoodOption[] }[];
}

const CATEGORY_ORDER: FoodCategoryKey[] = ['protein', 'carbs', 'fats', 'tea_spice'];

export function getRecommendation(phase: Phase, symptoms: SymptomTag[]): PlateRecommendation {
  const content = KNOWLEDGE_BASE[phase];
  const symptomNotes = symptoms
    .map((tag) => SYMPTOM_NOTES[tag])
    .filter((note): note is string => Boolean(note));

  return {
    focusNutrients: content.focusNutrients,
    explanation: content.explanation,
    symptomNotes,
    categories: CATEGORY_ORDER.map((key) => ({ key, options: content.categories[key] })),
  };
}
