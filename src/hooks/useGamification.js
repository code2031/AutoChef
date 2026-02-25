import { useLocalStorage } from './useLocalStorage.js';
import { checkNewBadges } from '../lib/achievements.js';

export function useGamification() {
  const [streak, setStreak] = useLocalStorage('game_streak', 0);
  const [lastCookDate, setLastCookDate] = useLocalStorage('game_last_cook_date', null);
  const [badges, setBadges] = useLocalStorage('game_badges', []);
  const [stats, setStats] = useLocalStorage('game_stats', {
    totalRecipes: 0,
    photoScans: 0,
    totalSaved: 0,
    cuisinesTried: [],
    dietsTried: [],
    hardRecipes: 0,
    surpriseUses: 0,
  });

  const updateStat = (key, updater) => {
    setStats(prev => ({ ...prev, [key]: updater(prev[key]) }));
  };

  const recordRecipe = (cuisine, diet, difficulty) => {
    // Update streak
    const today = new Date().toDateString();
    if (lastCookDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      setStreak(prev => lastCookDate === yesterday ? prev + 1 : 1);
      setLastCookDate(today);
    }

    setStats(prev => {
      const updated = {
        ...prev,
        totalRecipes: prev.totalRecipes + 1,
        hardRecipes: difficulty === 'Hard' ? (prev.hardRecipes || 0) + 1 : (prev.hardRecipes || 0),
        cuisinesTried: cuisine && cuisine !== 'any' && !prev.cuisinesTried.includes(cuisine)
          ? [...prev.cuisinesTried, cuisine]
          : prev.cuisinesTried,
        dietsTried: diet && diet !== 'none' && !prev.dietsTried.includes(diet)
          ? [...prev.dietsTried, diet]
          : prev.dietsTried,
      };
      return updated;
    });
  };

  const recordPhotoScan = () => {
    updateStat('photoScans', n => n + 1);
  };

  const recordSave = () => {
    updateStat('totalSaved', n => n + 1);
  };

  const recordSurprise = () => {
    updateStat('surpriseUses', n => n + 1);
  };

  const recordChallengeComplete = (challengeStreak) => {
    setStats(prev => ({
      ...prev,
      challengesCompleted: (prev.challengesCompleted || 0) + 1,
      challengeStreak: challengeStreak || (prev.challengeStreak || 0) + 1,
    }));
  };

  const recordNewCuisine = () => {
    // no-op (XP removed)
  };

  // Check and unlock new badges, returns array of newly unlocked badge objects
  const checkAndUnlockBadges = (currentStats, currentStreak) => {
    const statsWithStreak = { ...currentStats, streak: currentStreak };
    const newBadges = checkNewBadges(statsWithStreak, badges);
    if (newBadges.length > 0) {
      setBadges(prev => [...prev, ...newBadges.map(b => b.id)]);
    }
    return newBadges;
  };

  return {
    streak,
    badges,
    stats,
    recordRecipe,
    recordPhotoScan,
    recordSave,
    recordSurprise,
    recordNewCuisine,
    recordChallengeComplete,
    checkAndUnlockBadges,
  };
}
