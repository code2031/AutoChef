export const CHALLENGE_POOL = [
  'truffle', 'saffron', 'miso', 'tahini', 'sumac', 'harissa', 'yuzu', 'gochujang',
  'preserved lemon', 'tamarind', 'shiso', 'pomegranate', "za'atar", 'berbere',
  'ras el hanout', 'smoked paprika', 'mirin', 'fish sauce', 'black garlic', 'elderflower',
  'rose water', 'cardamom', 'star anise', 'lemongrass', 'galangal', 'makrut lime',
  'wakame', 'bonito flakes', 'dashi', 'white miso', 'ponzu', 'chili crisp', 'za\'atar',
  'fenugreek', 'asafoetida', 'nigella seeds', 'amchur', 'kokum', 'annatto', 'epazote',
  'culantro', 'shichimi', 'furikake', 'umeboshi', 'kaffir lime', 'pandan', 'butterfly pea',
  'beet powder', 'matcha', 'hojicha', 'ube', 'jackfruit', 'celeriac', 'kohlrabi', 'fennel',
  'radicchio', 'endive', 'romanesco', 'sea vegetables', 'purslane', 'sumac',
  'grains of paradise', 'long pepper', 'tonka bean', 'amaro', 'verjuice',
];

export function getDailyChallengeIngredient() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return CHALLENGE_POOL[dayIndex % CHALLENGE_POOL.length];
}

export function getChallengeState() {
  try {
    const raw = localStorage.getItem('daily_challenge');
    if (!raw) return { lastCompletedDate: null, streak: 0, totalCompleted: 0 };
    return JSON.parse(raw);
  } catch {
    return { lastCompletedDate: null, streak: 0, totalCompleted: 0 };
  }
}

export function markChallengeComplete(state) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newStreak = state.lastCompletedDate === yesterday
    ? (state.streak || 0) + 1
    : 1;
  const newState = {
    lastCompletedDate: today,
    streak: newStreak,
    totalCompleted: (state.totalCompleted || 0) + 1,
  };
  try {
    localStorage.setItem('daily_challenge', JSON.stringify(newState));
  } catch { /* ignore */ }
  return newState;
}

export function isChallengeCompletedToday(state) {
  return state.lastCompletedDate === new Date().toDateString();
}
