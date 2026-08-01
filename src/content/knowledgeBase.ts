import type { Phase, SymptomTag } from '@/types';

export interface FoodOption {
  id: string;
  emoji: string;
  name: string;
  isLocal: boolean; // true = доступный локальный продукт, false = международная альтернатива
}

export type FoodCategoryKey = 'protein' | 'carbs' | 'fats' | 'tea_spice';

export interface PhaseContent {
  focusNutrients: string[];
  explanation: string;
  categories: Record<FoodCategoryKey, FoodOption[]>;
}

export const KNOWLEDGE_BASE: Record<Phase, PhaseContent> = {
  menstrual: {
    focusNutrients: ['Железо', 'Омега-3'],
    explanation:
      'В менструальную фазу организм теряет железо и справляется с лёгким воспалением — важно восполнять запасы и поддерживать тепло.',
    categories: {
      protein: [
        { id: 'beef_liver', emoji: '🥩', name: 'Говяжья печень', isLocal: true },
        { id: 'lentils', emoji: '🫘', name: 'Чечевица', isLocal: true },
        { id: 'salmon', emoji: '🐟', name: 'Лосось', isLocal: false },
      ],
      carbs: [
        { id: 'buckwheat_m', emoji: '🌾', name: 'Гречка', isLocal: true },
        { id: 'quinoa_m', emoji: '🍚', name: 'Киноа', isLocal: false },
      ],
      fats: [
        { id: 'sunflower_seeds', emoji: '🌻', name: 'Семечки подсолнечника', isLocal: true },
        { id: 'avocado_m', emoji: '🥑', name: 'Авокадо', isLocal: false },
      ],
      tea_spice: [
        { id: 'ginger_tea', emoji: '🫚', name: 'Имбирный чай', isLocal: true },
        { id: 'turmeric_tea', emoji: '🟡', name: 'Чай с куркумой', isLocal: false },
      ],
    },
  },
  follicular: {
    focusNutrients: ['B-витамины', 'Клетчатка'],
    explanation:
      'Эстроген растёт, энергия и метаболизм ускоряются — организму хорошо с лёгкими белками и свежими овощами.',
    categories: {
      protein: [
        { id: 'eggs', emoji: '🥚', name: 'Яйца', isLocal: true },
        { id: 'chicken', emoji: '🍗', name: 'Курица', isLocal: true },
        { id: 'tofu', emoji: '🧊', name: 'Тофу', isLocal: false },
      ],
      carbs: [
        { id: 'oats', emoji: '🌾', name: 'Овсянка', isLocal: true },
        { id: 'quinoa_f', emoji: '🍚', name: 'Киноа', isLocal: false },
      ],
      fats: [
        { id: 'flaxseed', emoji: '🌱', name: 'Семена льна', isLocal: true },
        { id: 'almonds', emoji: '🌰', name: 'Миндаль', isLocal: false },
      ],
      tea_spice: [
        { id: 'green_tea', emoji: '🍵', name: 'Зелёный чай', isLocal: false },
        { id: 'mint_tea', emoji: '🌿', name: 'Мятный чай', isLocal: true },
      ],
    },
  },
  ovulatory: {
    focusNutrients: ['Клетчатка', 'Антиоксиданты'],
    explanation:
      'Пик эстрогена — печени нужна поддержка клетчаткой и зеленью, чтобы вывести его избыток.',
    categories: {
      protein: [
        { id: 'white_fish', emoji: '🐟', name: 'Белая рыба', isLocal: true },
        { id: 'tofu_o', emoji: '🧊', name: 'Тофу', isLocal: false },
      ],
      carbs: [
        { id: 'beets', emoji: '🍠', name: 'Свёкла', isLocal: true },
        { id: 'sweet_potato_o', emoji: '🍠', name: 'Батат', isLocal: false },
      ],
      fats: [
        { id: 'olive_oil', emoji: '🫒', name: 'Оливковое масло', isLocal: false },
        { id: 'pumpkin_seeds_o', emoji: '🎃', name: 'Тыквенные семечки', isLocal: true },
      ],
      tea_spice: [
        { id: 'dandelion_tea', emoji: '🌼', name: 'Чай из одуванчика', isLocal: true },
        { id: 'rooibos_tea', emoji: '🍂', name: 'Чай ройбос', isLocal: false },
      ],
    },
  },
  luteal: {
    focusNutrients: ['Магний', 'B6'],
    explanation:
      'Прогестерон требует больше энергии, а магний расходуется быстрее — отсюда тяга к сладкому.',
    categories: {
      protein: [
        { id: 'turkey', emoji: '🦃', name: 'Индейка', isLocal: true },
        { id: 'salmon_l', emoji: '🐟', name: 'Лосось', isLocal: false },
      ],
      carbs: [
        { id: 'buckwheat_l', emoji: '🌾', name: 'Гречка', isLocal: true },
        { id: 'sweet_potato_l', emoji: '🥔', name: 'Батат', isLocal: false },
      ],
      fats: [
        { id: 'pumpkin_seeds_l', emoji: '🎃', name: 'Тыквенные семечки', isLocal: true },
        { id: 'avocado_l', emoji: '🥑', name: 'Авокадо', isLocal: false },
      ],
      tea_spice: [
        { id: 'chamomile_tea', emoji: '🌼', name: 'Ромашковый чай', isLocal: true },
        { id: 'turmeric_tea_l', emoji: '🟡', name: 'Чай с куркумой', isLocal: false },
      ],
    },
  },
};

export const SYMPTOM_NOTES: Partial<Record<SymptomTag, string>> = {
  sugar_craving: 'Тяга к сладкому сегодня — это реакция мозга на расход магния, а не слабость воли.',
  bloating: 'Вздутие часто связано с замедлением ЖКТ в этой фазе — тёплая, тушёная еда сегодня комфортнее сырой.',
  cramps: 'При спазмах организму особенно нужны магний и омега-3 — они мягко снижают простагландины.',
};
