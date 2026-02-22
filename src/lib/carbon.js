// Carbon footprint scores (g CO₂e per typical recipe portion)
const CARBON_TABLE = {
  beef: 27000, lamb: 24000, pork: 7600, chicken: 6900, turkey: 7200,
  fish: 6100, salmon: 7000, shrimp: 12000, cheese: 13500,
  eggs: 4500, milk: 3200, butter: 9000, cream: 5000, yogurt: 3700,
  tofu: 2000, tempeh: 1800, rice: 4000, pasta: 1900, bread: 1400,
  flour: 1200, potato: 380, sweet: 600, tomato: 1400, carrot: 370,
  onion: 230, spinach: 900, broccoli: 530, cauliflower: 800,
  lentils: 900, beans: 800, chickpeas: 700, quinoa: 1400,
  nuts: 2500, avocado: 2500, chocolate: 19000, coffee: 3500,
};

const RATINGS = [
  { max: 2000, label: 'Very Low', color: '#22c55e', icon: '🌱' },
  { max: 5000, label: 'Low', color: '#86efac', icon: '🌿' },
  { max: 10000, label: 'Medium', color: '#fbbf24', icon: '🟡' },
  { max: 20000, label: 'High', color: '#f97316', icon: '🔴' },
  { max: Infinity, label: 'Very High', color: '#ef4444', icon: '♨️' },
];

export function getCarbonScore(ingredients) {
  let total = 0;
  for (const ing of ingredients) {
    const lower = ing.toLowerCase();
    for (const [key, co2] of Object.entries(CARBON_TABLE)) {
      if (lower.includes(key)) {
        total += co2;
        break;
      }
    }
  }
  const rating = RATINGS.find(r => total <= r.max) || RATINGS[RATINGS.length - 1];
  return { total, label: rating.label, color: rating.color, icon: rating.icon };
}
