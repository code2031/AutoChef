// Month-based seasonal ingredient sets (1-indexed)
const SEASONAL = {
  1:  { label: 'Winter', ingredients: ['root vegetables', 'citrus', 'cabbage', 'leeks', 'Brussels sprouts'] },
  2:  { label: 'Winter', ingredients: ['citrus', 'parsnips', 'turnips', 'kale', 'blood oranges'] },
  3:  { label: 'Early Spring', ingredients: ['asparagus', 'peas', 'radishes', 'spring onions', 'artichokes'] },
  4:  { label: 'Spring', ingredients: ['asparagus', 'peas', 'spinach', 'radishes', 'morel mushrooms'] },
  5:  { label: 'Spring', ingredients: ['strawberries', 'asparagus', 'peas', 'mint', 'new potatoes'] },
  6:  { label: 'Early Summer', ingredients: ['strawberries', 'zucchini', 'peas', 'basil', 'cherries'] },
  7:  { label: 'Summer', ingredients: ['tomatoes', 'corn', 'zucchini', 'peaches', 'blueberries'] },
  8:  { label: 'Summer', ingredients: ['tomatoes', 'corn', 'eggplant', 'peppers', 'watermelon'] },
  9:  { label: 'Early Fall', ingredients: ['butternut squash', 'apples', 'pears', 'sweet potatoes', 'figs'] },
  10: { label: 'Fall', ingredients: ['pumpkin', 'apples', 'Brussels sprouts', 'cranberries', 'wild mushrooms'] },
  11: { label: 'Late Fall', ingredients: ['sweet potatoes', 'pears', 'cranberries', 'kale', 'chestnuts'] },
  12: { label: 'Winter', ingredients: ['citrus', 'pomegranate', 'root vegetables', 'chestnuts', 'Brussels sprouts'] },
};

export function getSeasonalIngredients() {
  const month = new Date().getMonth() + 1;
  return SEASONAL[month] || SEASONAL[1];
}

export function getSeasonalHint() {
  const { label, ingredients } = getSeasonalIngredients();
  return `It is currently ${label} season. Consider incorporating seasonal ingredients like: ${ingredients.join(', ')}.`;
}
