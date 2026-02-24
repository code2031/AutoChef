export const LEVEL_THRESHOLDS = [
  { level: 1,  title: 'Apprentice',       min: 0 },
  { level: 2,  title: 'Kitchen Helper',   min: 50 },
  { level: 3,  title: 'Home Cook',        min: 120 },
  { level: 4,  title: 'Line Cook',        min: 220 },
  { level: 5,  title: 'Prep Chef',        min: 350 },
  { level: 6,  title: 'Sauté Chef',       min: 520 },
  { level: 7,  title: 'Pastry Chef',      min: 730 },
  { level: 8,  title: 'Station Chef',     min: 990 },
  { level: 9,  title: 'Sous Chef',        min: 1300 },
  { level: 10, title: 'Chef de Partie',   min: 1670 },
  { level: 11, title: 'Senior Chef',      min: 2100 },
  { level: 12, title: 'Executive Chef',   min: 2600 },
  { level: 13, title: 'Head Chef',        min: 3200 },
  { level: 14, title: 'Chef Patron',      min: 3900 },
  { level: 15, title: 'Culinary Artist',  min: 4700 },
  { level: 16, title: 'Grand Chef',       min: 5600 },
  { level: 17, title: 'Master Chef',      min: 6600 },
  { level: 18, title: 'Chef Ambassador',  min: 7700 },
  { level: 19, title: 'Culinary Legend',  min: 8900 },
  { level: 20, title: 'Michelin Star',    min: 10200 },
  { level: 21, title: 'Grand Maître',     min: 12000 },
];

export function getLevel(points) {
  const p = points || 0;
  let current = LEVEL_THRESHOLDS[0];
  for (const tier of LEVEL_THRESHOLDS) {
    if (p >= tier.min) current = tier;
    else break;
  }
  const idx = LEVEL_THRESHOLDS.indexOf(current);
  const next = LEVEL_THRESHOLDS[idx + 1] || null;
  const pointsForNext = next ? next.min : null;
  const progress = next
    ? Math.min(100, Math.round(((p - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { level: current.level, title: current.title, pointsForNext, progress, currentMin: current.min };
}

export const BADGES = [
  {
    id: 'first_recipe',
    name: 'First Dish',
    icon: '👨‍🍳',
    description: 'Generated your first recipe!',
    hint: 'Generate any recipe to unlock.',
    check: (stats) => stats.totalRecipes >= 1,
  },
  {
    id: 'ten_recipes',
    name: 'Home Chef',
    icon: '🏆',
    description: 'Generated 10 recipes.',
    hint: 'Generate 10 total recipes.',
    check: (stats) => stats.totalRecipes >= 10,
  },
  {
    id: 'photo_scanner',
    name: 'Snap & Cook',
    icon: '📸',
    description: 'Used photo scanning to detect ingredients.',
    hint: 'Use the camera to scan your fridge or pantry.',
    check: (stats) => stats.photoScans >= 1,
  },
  {
    id: 'cuisine_explorer',
    name: 'Globe Trotter',
    icon: '🌍',
    description: 'Tried 5 different cuisines.',
    hint: 'Cook recipes from 5 different cuisine styles.',
    check: (stats) => (stats.cuisinesTried || []).length >= 5,
  },
  {
    id: 'saved_recipe',
    name: 'Bookmarked',
    icon: '❤️',
    description: 'Saved your first recipe to favourites.',
    hint: 'Save any recipe using the heart icon.',
    check: (stats) => stats.totalSaved >= 1,
  },
  {
    id: 'streak_3',
    name: 'Consistency',
    icon: '🔥',
    description: 'Cooked 3 days in a row.',
    hint: 'Cook (finish Cooking Mode) on 3 consecutive days.',
    check: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    icon: '⚡',
    description: 'Cooked 7 days in a row.',
    hint: 'Maintain a 7-day cooking streak.',
    check: (stats) => stats.streak >= 7,
  },
  {
    id: 'vegan_explorer',
    name: 'Green Chef',
    icon: '🥦',
    description: 'Generated a vegan recipe.',
    hint: 'Set diet to Vegan and generate a recipe.',
    check: (stats) => (stats.dietsTried || []).includes('vegan'),
  },
  {
    id: 'hard_cook',
    name: 'Master Chef',
    icon: '🌟',
    description: 'Generated 3 Hard-difficulty recipes.',
    hint: 'Generate 3 Hard-difficulty recipes.',
    check: (stats) => (stats.hardRecipes || 0) >= 3,
  },
  {
    id: 'surprise_chef',
    name: 'Wild Card',
    icon: '🎲',
    description: 'Used the Surprise Me button.',
    hint: 'Hit the I\'m Feeling Lucky button.',
    check: (stats) => stats.surpriseUses >= 1,
  },
];

export function checkNewBadges(stats, alreadyUnlocked) {
  return BADGES.filter(
    (badge) => !alreadyUnlocked.includes(badge.id) && badge.check(stats)
  );
}
