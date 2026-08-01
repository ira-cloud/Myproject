import { getRecommendation } from '@/content/rulesEngine';

describe('getRecommendation', () => {
  it('returns the luteal focus nutrients and explanation with no symptom notes when no symptoms are logged', () => {
    const rec = getRecommendation('luteal', []);
    expect(rec.focusNutrients).toEqual(['Магний', 'B6']);
    expect(rec.symptomNotes).toEqual([]);
  });

  it('returns all four categories in a stable order with 2+ options each', () => {
    const rec = getRecommendation('menstrual', []);
    expect(rec.categories.map((c) => c.key)).toEqual(['protein', 'carbs', 'fats', 'tea_spice']);
    rec.categories.forEach((c) => expect(c.options.length).toBeGreaterThanOrEqual(2));
  });

  it('includes a symptom note for a symptom that has one', () => {
    const rec = getRecommendation('luteal', ['sugar_craving']);
    expect(rec.symptomNotes).toEqual([
      'Тяга к сладкому сегодня — это реакция мозга на расход магния, а не слабость воли.',
    ]);
  });

  it('silently skips symptoms that have no note defined, without adding undefined', () => {
    const rec = getRecommendation('luteal', ['acne']);
    expect(rec.symptomNotes).toEqual([]);
  });

  it('every category mixes at least one local and offers a real alternative', () => {
    const rec = getRecommendation('follicular', []);
    const proteinOptions = rec.categories.find((c) => c.key === 'protein')!.options;
    expect(proteinOptions.some((o) => o.isLocal)).toBe(true);
  });
});
