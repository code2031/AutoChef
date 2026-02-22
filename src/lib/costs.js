// Rough estimated cost per ingredient (USD per typical recipe portion)
const COST_TABLE = {
  chicken: 3.0, beef: 4.5, pork: 3.0, lamb: 5.0, turkey: 3.5,
  fish: 4.0, salmon: 5.0, tuna: 2.5, shrimp: 3.5, crab: 5.5,
  tofu: 1.5, tempeh: 1.8, eggs: 0.5, milk: 0.3, butter: 0.4,
  cream: 0.8, cheese: 1.2, yogurt: 0.7, rice: 0.5, pasta: 0.6,
  bread: 0.4, flour: 0.2, oats: 0.3, quinoa: 0.9, lentils: 0.5,
  beans: 0.5, chickpeas: 0.6, potato: 0.4, sweet: 0.6,
  tomato: 0.6, onion: 0.3, garlic: 0.2, carrot: 0.25, celery: 0.3,
  spinach: 0.8, lettuce: 0.5, broccoli: 0.7, cauliflower: 0.8,
  zucchini: 0.6, mushroom: 1.0, pepper: 0.8, lemon: 0.4, lime: 0.35,
  apple: 0.5, banana: 0.3, avocado: 1.2, coconut: 0.6, mango: 0.9,
  oil: 0.2, vinegar: 0.15, soy: 0.2, ginger: 0.3, cilantro: 0.4,
  basil: 0.5, parsley: 0.4, stock: 0.4, broth: 0.4, wine: 0.8,
  tomatoes: 0.6, noodle: 0.6, corn: 0.4, peas: 0.4, cabbage: 0.35,
};

export function estimateCost(ingredients) {
  let total = 0;
  let matched = 0;
  for (const ing of ingredients) {
    const lower = ing.toLowerCase();
    let found = false;
    for (const [key, cost] of Object.entries(COST_TABLE)) {
      if (lower.includes(key)) {
        total += cost;
        matched++;
        found = true;
        break;
      }
    }
    if (!found) total += 0.8; // fallback per unmatched
  }
  return { total: total.toFixed(2), matched };
}
