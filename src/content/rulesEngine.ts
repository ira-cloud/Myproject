import type { Phase, SymptomTag } from '@/types';
import { KNOWLEDGE_BASE, SYMPTOM_NOTES, type FoodCategoryKey, type FoodOption } from '@/content/knowledgeBase';

export interface PlateRecommendation {
  focusNutrients: string[];
  explanation: string;
  symptomNotes: string[];
  categories: { key: FoodCategoryKey; options: FoodOption[] }[];
}

const CATEGORY_ORDER: FoodCategoryKey[] = ['protein', 'carbs', 'fats', 'tea_spice'];

// Gluten/dairy/sugar are already excluded from the knowledge base for everyone,
// so 'gluten_free'/'dairy_free' need no runtime filtering — 'vegetarian' is the
// only onboarding restriction that can still contradict a recommendation.
export const VEGETARIAN_RESTRICTION = 'vegetarian';

function applyRestrictions(
  key: FoodCategoryKey,
  options: FoodOption[],
  dietaryRestrictions: string[]
): FoodOption[] {
  if (key !== 'protein') return options;
  if (!dietaryRestrictions.includes(VEGETARIAN_RESTRICTION)) return options;
  const vegetarian = options.filter((opt) => opt.isVegetarian);
  // Never hand back an empty category: if a phase has no vegetarian protein at
  // all, showing the unfiltered list is less broken than showing nothing.
  // (Today every phase has at least one, guarded by a test in rulesEngine.test.)
  return vegetarian.length > 0 ? vegetarian : options;
}

export function getRecommendation(
  phase: Phase,
  symptoms: SymptomTag[],
  dietaryRestrictions: string[] = []
): PlateRecommendation {
  const content = KNOWLEDGE_BASE[phase];
  const symptomNotes = symptoms
    .map((tag) => SYMPTOM_NOTES[tag])
    .filter((note): note is string => Boolean(note));

  return {
    focusNutrients: content.focusNutrients,
    explanation: content.explanation,
    symptomNotes,
    categories: CATEGORY_ORDER.map((key) => ({
      key,
      options: applyRestrictions(key, content.categories[key], dietaryRestrictions),
    })),
  };
}
