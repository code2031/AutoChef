// Approximate freshwater footprint (litres of water per typical recipe
// portion) for common ingredients. Figures are rough averages drawn from
// public water-footprint datasets — intended as an educational estimate.
const WATER_TABLE = {
  beef: 1540, lamb: 1400, pork: 480, chicken: 330, turkey: 360,
  fish: 300, salmon: 320, shrimp: 600, cheese: 380, butter: 600,
  eggs: 200, milk: 250, cream: 300, yogurt: 230,
  rice: 240, pasta: 180, bread: 150, flour: 160, oats: 180,
  tofu: 220, tempeh: 200, lentils: 170, beans: 180, chickpeas: 180,
  nuts: 900, almond: 1100, avocado: 230, chocolate: 1700, coffee: 530,
  tomato: 50, potato: 60, onion: 40, carrot: 40, lettuce: 35,
  apple: 70, banana: 80, sugar: 150, olive: 300, 'olive oil': 360,
};

const RATINGS = [
  { max: 500, label: 'Low', color: '#22c55e', icon: '💧' },
  { max: 1500, label: 'Moderate', color: '#38bdf8', icon: '💧' },
  { max: 4000, label: 'High', color: '#f59e0b', icon: '💧' },
  { max: Infinity, label: 'Very High', color: '#ef4444', icon: '🌊' },
];

export function getWaterFootprint(ingredients) {
  let total = 0;
  for (const ing of ingredients || []) {
    const lower = ing.toLowerCase();
    for (const [key, litres] of Object.entries(WATER_TABLE)) {
      if (lower.includes(key)) {
        total += litres;
        break;
      }
    }
  }
  if (total === 0) return null;
  const rating = RATINGS.find(r => total <= r.max) || RATINGS[RATINGS.length - 1];
  // Express in terms a person can picture: ~10 L per shower-minute.
  const showers = Math.round(total / 65);
  return { total, label: rating.label, color: rating.color, icon: rating.icon, showers };
}
