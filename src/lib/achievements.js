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
  {
    id: 'challenge_first',
    name: 'Challenge Accepted',
    icon: '🎯',
    description: 'Completed your first daily cooking challenge.',
    hint: 'Complete the Daily Challenge ingredient in a recipe.',
    check: (stats) => (stats.challengesCompleted || 0) >= 1,
  },
  {
    id: 'challenge_streak_5',
    name: 'Unstoppable',
    icon: '🏅',
    description: 'Completed daily challenges 5 days in a row.',
    hint: 'Complete the daily challenge 5 days in a row.',
    check: (stats) => (stats.challengeStreak || 0) >= 5,
  },
];

export function checkNewBadges(stats, alreadyUnlocked) {
  return BADGES.filter(
    (badge) => !alreadyUnlocked.includes(badge.id) && badge.check(stats)
  );
}
