export const BADGES = [
  {
    id: 'first_recipe',
    name: 'First Dish',
    icon: '👨‍🍳',
    description: 'Generated your first recipe!',
    check: (stats) => stats.totalRecipes >= 1,
  },
  {
    id: 'ten_recipes',
    name: 'Home Chef',
    icon: '🏆',
    description: 'Generated 10 recipes.',
    check: (stats) => stats.totalRecipes >= 10,
  },
  {
    id: 'photo_scanner',
    name: 'Snap & Cook',
    icon: '📸',
    description: 'Used photo scanning to detect ingredients.',
    check: (stats) => stats.photoScans >= 1,
  },
  {
    id: 'cuisine_explorer',
    name: 'Globe Trotter',
    icon: '🌍',
    description: 'Tried 5 different cuisines.',
    check: (stats) => (stats.cuisinesTried || []).length >= 5,
  },
  {
    id: 'saved_recipe',
    name: 'Bookmarked',
    icon: '❤️',
    description: 'Saved your first recipe to favourites.',
    check: (stats) => stats.totalSaved >= 1,
  },
  {
    id: 'streak_3',
    name: 'Consistency',
    icon: '🔥',
    description: 'Cooked 3 days in a row.',
    check: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    icon: '⚡',
    description: 'Cooked 7 days in a row.',
    check: (stats) => stats.streak >= 7,
  },
  {
    id: 'vegan_explorer',
    name: 'Green Chef',
    icon: '🥦',
    description: 'Generated a vegan recipe.',
    check: (stats) => (stats.dietsTried || []).includes('vegan'),
  },
  {
    id: 'hard_cook',
    name: 'Master Chef',
    icon: '🌟',
    description: 'Generated 3 Hard-difficulty recipes.',
    check: (stats) => (stats.hardRecipes || 0) >= 3,
  },
  {
    id: 'surprise_chef',
    name: 'Wild Card',
    icon: '🎲',
    description: 'Used the Surprise Me button.',
    check: (stats) => stats.surpriseUses >= 1,
  },
];

export function checkNewBadges(stats, alreadyUnlocked) {
  return BADGES.filter(
    (badge) => !alreadyUnlocked.includes(badge.id) && badge.check(stats)
  );
}
