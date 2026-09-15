// Shared measurement-conversion utilities used across kitchen tools.
// Pure functions — no React, no side effects.

// Volume conversions to millilitres
export const VOLUME_TO_ML = {
  tsp: 4.929,
  tbsp: 14.787,
  cup: 236.588,
  'fl oz': 29.574,
  pint: 473.176,
  quart: 946.353,
  litre: 1000,
  ml: 1,
};

// Weight conversions to grams
export const WEIGHT_TO_G = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

// Approximate density of common ingredients in grams per US cup.
// Lets us convert a volume measure (cups/tbsp) into a kitchen-scale weight.
export const INGREDIENT_DENSITY_G_PER_CUP = {
  'all-purpose flour': 125,
  'bread flour': 130,
  'whole wheat flour': 120,
  'granulated sugar': 200,
  'brown sugar (packed)': 220,
  'powdered sugar': 120,
  'butter': 227,
  'milk': 240,
  'water': 237,
  'honey': 340,
  'maple syrup': 322,
  'olive oil': 216,
  'vegetable oil': 218,
  'rice (uncooked)': 185,
  'rolled oats': 90,
  'cocoa powder': 100,
  'cornstarch': 128,
  'salt (table)': 292,
  'kosher salt': 240,
  'parmesan (grated)': 100,
  'breadcrumbs': 108,
  'peanut butter': 258,
  'yogurt': 245,
  'sour cream': 230,
  'chopped nuts': 120,
  'chocolate chips': 170,
  'shredded cheese': 113,
};

export function convertVolume(value, fromUnit, toUnit) {
  const v = parseFloat(value);
  if (!Number.isFinite(v) || !VOLUME_TO_ML[fromUnit] || !VOLUME_TO_ML[toUnit]) return null;
  return (v * VOLUME_TO_ML[fromUnit]) / VOLUME_TO_ML[toUnit];
}

export function convertWeight(value, fromUnit, toUnit) {
  const v = parseFloat(value);
  if (!Number.isFinite(v) || !WEIGHT_TO_G[fromUnit] || !WEIGHT_TO_G[toUnit]) return null;
  return (v * WEIGHT_TO_G[fromUnit]) / WEIGHT_TO_G[toUnit];
}

// Convert a volume of an ingredient into grams using its density.
export function volumeToGrams(value, fromUnit, ingredientKey) {
  const cups = convertVolume(value, fromUnit, 'cup');
  const density = INGREDIENT_DENSITY_G_PER_CUP[ingredientKey];
  if (cups == null || !density) return null;
  return cups * density;
}

export function cToF(c) {
  const v = parseFloat(c);
  return Number.isFinite(v) ? (v * 9) / 5 + 32 : null;
}

export function fToC(f) {
  const v = parseFloat(f);
  return Number.isFinite(v) ? ((v - 32) * 5) / 9 : null;
}

// Round to a sensible number of decimals for kitchen display.
export function tidy(n, decimals = 2) {
  if (n == null || !Number.isFinite(n)) return '';
  const r = Math.round(n * 10 ** decimals) / 10 ** decimals;
  return String(r);
}
