// Aisle keywords for categorization
const AISLE_KW = {
  'Produce': ['onion', 'garlic', 'tomato', 'pepper', 'carrot', 'potato', 'spinach', 'broccoli', 'cucumber', 'avocado', 'lemon', 'lime', 'ginger', 'mushroom', 'celery', 'lettuce', 'kale', 'zucchini', 'eggplant', 'apple', 'banana', 'orange', 'berry', 'berries', 'corn', 'pea', 'bean', 'asparagus', 'cabbage', 'scallion', 'shallot', 'leek', 'cilantro', 'parsley', 'basil', 'mint', 'dill', 'chive', 'thyme', 'rosemary'],
  'Meat & Fish': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'lamb', 'turkey', 'bacon', 'steak', 'duck', 'sausage', 'ground', 'mince', 'prawn', 'crab', 'lobster', 'cod', 'tilapia', 'halibut', 'anchovy', 'sardine', 'meatball', 'ham', 'salami', 'prosciutto'],
  'Dairy & Eggs': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'ricotta', 'gouda', 'feta', 'sour cream', 'half-and-half', 'heavy cream', 'ghee', 'kefir'],
  'Bakery': ['bread', 'roll', 'baguette', 'tortilla', 'pita', 'naan', 'croissant', 'bagel', 'cracker', 'breadcrumb', 'panko', 'cake', 'pastry'],
  'Canned & Dry Goods': ['rice', 'pasta', 'flour', 'sugar', 'honey', 'soy sauce', 'stock', 'broth', 'canned', 'lentil', 'chickpea', 'kidney bean', 'black bean', 'quinoa', 'couscous', 'oat', 'cornstarch', 'baking powder', 'baking soda', 'yeast', 'noodle', 'cereal', 'dried', 'lentils'],
  'Frozen': ['frozen', 'ice cream', 'gelato', 'ice'],
  'Herbs & Spices': ['salt', 'pepper', 'cumin', 'paprika', 'turmeric', 'cinnamon', 'oregano', 'cayenne', 'chili powder', 'curry', 'nutmeg', 'cardamom', 'clove', 'bay leaf', 'anise', 'coriander', 'allspice', 'garam masala', 'five spice', 'za\'atar', 'sumac', 'saffron', 'vanilla'],
  'Oils & Condiments': ['oil', 'vinegar', 'mustard', 'ketchup', 'mayonnaise', 'worcestershire', 'fish sauce', 'oyster sauce', 'hoisin', 'tahini', 'miso', 'sriracha', 'hot sauce', 'salsa', 'pesto', 'aioli', 'teriyaki', 'maple syrup', 'molasses'],
};

/**
 * Categorize ingredients into aisles. Returns object { aisleLabel: [ingredients] }
 */
export function categorizeByAisle(ingredients) {
  const out = {};
  const used = new Set();
  Object.entries(AISLE_KW).forEach(([aisle, keywords]) => {
    const matched = ingredients.filter(ing => {
      if (used.has(ing)) return false;
      const lower = ing.toLowerCase();
      return keywords.some(kw => lower.includes(kw));
    });
    if (matched.length > 0) {
      out[aisle] = matched;
      matched.forEach(x => used.add(x));
    }
  });
  const other = ingredients.filter(ing => !used.has(ing));
  if (other.length > 0) out['Other'] = other;
  return out;
}

/**
 * Parse an ingredient string into { qty, unit, name, original }
 */
export function parseIngredient(text) {
  const QTY_RE = /^(\d+(?:[./]\d+)?(?:\s*-\s*\d+(?:[./]\d+)?)?)\s*/;
  const UNIT_RE = /^(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|liters?|l|cloves?|slices?|pieces?|cans?|packages?|bunches?|heads?|stalks?|sprigs?|handfuls?|pinch(?:es)?)\s+/i;

  let remaining = text.trim();
  let qty = null;
  let unit = null;

  const qtyMatch = remaining.match(QTY_RE);
  if (qtyMatch) {
    qty = qtyMatch[1];
    remaining = remaining.slice(qtyMatch[0].length);
  }

  const unitMatch = remaining.match(UNIT_RE);
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    remaining = remaining.slice(unitMatch[0].length);
  }

  // Strip "of" prefix
  remaining = remaining.replace(/^of\s+/i, '');

  // Normalize: strip parenthetical notes for name matching
  const name = remaining.replace(/\(.*?\)/g, '').replace(/,.*$/, '').trim().toLowerCase();

  return { qty, unit, name, original: text };
}

/**
 * Normalize ingredient name for deduplication matching
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')   // remove parentheticals
    .replace(/,.*$/, '')        // remove after comma
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deduplicate ingredients by normalized name.
 * When units match, sum quantities. Otherwise keep the first occurrence and note duplicates.
 */
export function deduplicateIngredients(ingredients) {
  const groups = new Map(); // normalizedName -> [parsed items]

  ingredients.forEach(text => {
    const parsed = parseIngredient(text);
    const key = normalizeName(parsed.name);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(parsed);
  });

  const result = [];
  groups.forEach((items) => {
    if (items.length === 1) {
      result.push(items[0].original);
      return;
    }

    // Try to sum quantities if units match
    const firstUnit = items[0].unit;
    const allSameUnit = items.every(i => i.unit === firstUnit);
    if (allSameUnit && firstUnit) {
      let totalQty = 0;
      let canSum = true;
      items.forEach(i => {
        if (!i.qty) { canSum = false; return; }
        const numStr = i.qty.replace(/\s*-\s*\d+(?:[./]\d+)?$/, ''); // take low end of range
        // Parse fractions like "1/2" or decimals safely (no eval)
        const fractionMatch = numStr.match(/^(\d+)\/(\d+)$/);
        const num = fractionMatch
          ? parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])
          : parseFloat(numStr);
        if (isNaN(num)) canSum = false;
        else totalQty += num;
      });
      if (canSum) {
        const qtyStr = Number.isInteger(totalQty) ? String(totalQty) : totalQty.toFixed(2).replace(/\.?0+$/, '');
        result.push(`${qtyStr} ${firstUnit} ${items[0].name}`);
        return;
      }
    }

    // Can't sum: just use first occurrence (most complete text)
    result.push(items[0].original);
  });

  return result;
}

/**
 * Full pipeline: deduplicate then categorize by aisle.
 * Returns { aisleLabel: [ingredients] }
 */
export function buildSmartShoppingList(ingredients) {
  const deduped = deduplicateIngredients(ingredients);
  return categorizeByAisle(deduped);
}
