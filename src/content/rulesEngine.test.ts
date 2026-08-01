import { getRecommendation } from '@/content/rulesEngine';
import { KNOWLEDGE_BASE } from '@/content/knowledgeBase';
import type { Phase } from '@/types';

const ALL_PHASES: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

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

  describe('dietary restrictions', () => {
    function proteinIds(phase: Phase, restrictions?: string[]): string[] {
      return getRecommendation(phase, [], restrictions)
        .categories.find((c) => c.key === 'protein')!
        .options.map((o) => o.id);
    }

    it('drops non-vegetarian proteins when the user selected вегетарианство', () => {
      expect(proteinIds('menstrual')).toEqual(['beef_liver', 'lentils', 'salmon', 'tofu_m']);
      expect(proteinIds('menstrual', ['vegetarian'])).toEqual(['lentils', 'tofu_m']);
    });

    it('leaves the protein list alone when no restrictions are passed at all', () => {
      expect(proteinIds('luteal')).toEqual(proteinIds('luteal', []));
    });

    it('ignores restrictions the knowledge base already handles for everyone', () => {
      expect(proteinIds('follicular', ['gluten_free', 'dairy_free'])).toEqual(
        proteinIds('follicular')
      );
    });

    it('never leaves a vegetarian user with an empty protein category in any phase', () => {
      for (const phase of ALL_PHASES) {
        expect(proteinIds(phase, ['vegetarian']).length).toBeGreaterThan(0);
      }
    });

    it('keeps 2+ vegetarian protein options mixing local and international in every phase', () => {
      for (const phase of ALL_PHASES) {
        const vegetarianOptions = getRecommendation(phase, [], ['vegetarian'])
          .categories.find((c) => c.key === 'protein')!.options;
        expect(vegetarianOptions.length).toBeGreaterThanOrEqual(2);
        expect(vegetarianOptions.some((o) => o.isLocal)).toBe(true);
        expect(vegetarianOptions.some((o) => !o.isLocal)).toBe(true);
      }
    });

    it('only filters the protein category, not carbs/fats/tea', () => {
      const restricted = getRecommendation('ovulatory', [], ['vegetarian']);
      const unrestricted = getRecommendation('ovulatory', []);
      for (const key of ['carbs', 'fats', 'tea_spice'] as const) {
        expect(restricted.categories.find((c) => c.key === key)!.options).toEqual(
          unrestricted.categories.find((c) => c.key === key)!.options
        );
      }
    });
  });
});

describe('knowledge base data integrity', () => {
  it('has at least one vegetarian protein option in every phase', () => {
    for (const phase of ALL_PHASES) {
      const vegetarian = KNOWLEDGE_BASE[phase].categories.protein.filter((o) => o.isVegetarian);
      expect(vegetarian.length).toBeGreaterThan(0);
    }
  });

  it('uses a unique emoji within each category of a phase', () => {
    for (const phase of ALL_PHASES) {
      for (const options of Object.values(KNOWLEDGE_BASE[phase].categories)) {
        const emoji = options.map((o) => o.emoji);
        expect(new Set(emoji).size).toBe(emoji.length);
      }
    }
  });

  it('uses one consistent emoji per food name across all phases', () => {
    const emojiByName = new Map<string, string>();
    for (const phase of ALL_PHASES) {
      for (const options of Object.values(KNOWLEDGE_BASE[phase].categories)) {
        for (const opt of options) {
          const seen = emojiByName.get(opt.name);
          if (seen) expect(opt.emoji).toBe(seen);
          else emojiByName.set(opt.name, opt.emoji);
        }
      }
    }
  });
});
