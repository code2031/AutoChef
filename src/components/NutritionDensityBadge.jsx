import React from 'react';

// Feature 38: Nutrition density score — nutrients per calorie
// Simple keyword-based scoring: more diverse macros + lower calorie = higher density
export default function NutritionDensityBadge({ recipe }) {
  if (!recipe) return null;
  const { nutrition, calories } = recipe;
  if (!nutrition || !calories) return null;

  const cal = parseFloat(calories);
  if (!cal || cal <= 0) return null;

  const protein = parseFloat(nutrition.protein) || 0;
  const fiber = parseFloat(nutrition.fiber) || 0;

  // Score = (protein + fiber * 2) / calories * 100  (higher is more nutrient-dense)
  const score = ((protein + fiber * 2) / cal) * 100;

  let label, color, icon;
  if (score >= 8) { label = 'Very Dense'; color = 'text-green-400'; icon = '🌿'; }
  else if (score >= 4) { label = 'Nutrient-Rich'; color = 'text-lime-400'; icon = '🥗'; }
  else if (score >= 2) { label = 'Moderate'; color = 'text-amber-400'; icon = '⚖️'; }
  else { label = 'Low Density'; color = 'text-slate-500'; icon = '🍩'; }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/10 ${color}`}
      title={`Nutrition density score: ${score.toFixed(1)} (protein + 2×fiber per 100 cal)`}
    >
      {icon} {label}
    </span>
  );
}
