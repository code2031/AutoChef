export const EMOJI_MAP = {
  chicken: '🍗', beef: '🥩', pork: '🥓', fish: '🐟', salmon: '🐟', tuna: '🐟',
  shrimp: '🍤', egg: '🥚', eggs: '🥚', milk: '🥛', cheese: '🧀', butter: '🧈',
  yogurt: '🥛', cream: '🥛',
  tomato: '🍅', tomatoes: '🍅', onion: '🧅', garlic: '🧄', potato: '🥔',
  potatoes: '🥔', carrot: '🥕', carrots: '🥕', broccoli: '🥦', spinach: '🥬',
  lettuce: '🥬', cucumber: '🥒', pepper: '🫑', peppers: '🫑', mushroom: '🍄',
  mushrooms: '🍄', corn: '🌽', pea: '🟢', peas: '🟢', bean: '🫘', beans: '🫘',
  rice: '🍚', pasta: '🍝', bread: '🍞', flour: '🌾', oats: '🌾', noodles: '🍜',
  apple: '🍎', banana: '🍌', lemon: '🍋', lime: '🍋', orange: '🍊',
  strawberry: '🍓', blueberry: '🫐', avocado: '🥑', coconut: '🥥',
  olive: '🫒', olives: '🫒',
  oil: '🫙', 'olive oil': '🫙', salt: '🧂', sugar: '🍬',
  basil: '🌿', parsley: '🌿', cilantro: '🌿', ginger: '🫚', turmeric: '🟡',
  cumin: '🟤', paprika: '🔴', chili: '🌶️', curry: '🍛', soy: '🫙',
  lentils: '🫘', chickpeas: '🫘', tofu: '⬜', tempeh: '🟤',
};

export const INGREDIENT_SUGGESTIONS = [
  'chicken', 'beef', 'pork', 'salmon', 'tuna', 'shrimp', 'eggs', 'tofu', 'tempeh',
  'milk', 'cheese', 'butter', 'yogurt', 'cream',
  'tomatoes', 'onion', 'garlic', 'potato', 'carrot', 'broccoli', 'spinach',
  'lettuce', 'cucumber', 'pepper', 'mushrooms', 'corn', 'peas', 'beans',
  'rice', 'pasta', 'bread', 'flour', 'oats', 'noodles',
  'apple', 'banana', 'lemon', 'lime', 'orange', 'strawberry', 'avocado',
  'olive oil', 'salt', 'sugar', 'basil', 'parsley', 'cilantro', 'ginger',
  'turmeric', 'cumin', 'paprika', 'chili', 'soy sauce',
  'lentils', 'chickpeas', 'black beans',
];

export const SURPRISE_INGREDIENTS = [
  ['chicken', 'garlic', 'lemon', 'rosemary', 'olive oil'],
  ['eggs', 'spinach', 'cheese', 'mushrooms', 'onion'],
  ['salmon', 'ginger', 'soy sauce', 'garlic', 'sesame oil'],
  ['pasta', 'tomatoes', 'basil', 'garlic', 'parmesan'],
  ['beef', 'potato', 'carrot', 'onion', 'thyme'],
  ['tofu', 'broccoli', 'soy sauce', 'ginger', 'rice'],
  ['shrimp', 'garlic', 'butter', 'lemon', 'parsley'],
  ['chickpeas', 'tomatoes', 'spinach', 'cumin', 'garlic'],
  ['rice', 'beans', 'corn', 'pepper', 'cumin'],
  ['salmon', 'avocado', 'lemon', 'cucumber', 'dill'],
];

export function getEmojiForIngredient(name) {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '🥘';
}

export function getRandomSurpriseIngredients() {
  return SURPRISE_INGREDIENTS[Math.floor(Math.random() * SURPRISE_INGREDIENTS.length)];
}
