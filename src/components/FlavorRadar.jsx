import React from 'react';

const FLAVOR_KEYWORDS = {
  Sweet: ['sugar', 'honey', 'maple', 'chocolate', 'vanilla', 'cinnamon', 'fruit', 'apple', 'banana', 'mango', 'berry', 'caramel', 'coconut milk', 'sweet potato', 'corn', 'raisin', 'dates', 'jam', 'syrup'],
  Savory: ['chicken', 'beef', 'pork', 'lamb', 'steak', 'bacon', 'sausage', 'stock', 'broth', 'soy', 'cheese', 'mushroom', 'garlic', 'onion', 'worcestershire', 'anchovy', 'parmesan', 'turkey'],
  Spicy: ['chili', 'pepper', 'cayenne', 'sriracha', 'gochujang', 'wasabi', 'horseradish', 'jalapeno', 'habanero', 'paprika', 'hot sauce', 'tabasco', 'chipotle', 'harissa', 'red pepper', 'szechuan'],
  Umami: ['soy', 'mushroom', 'tomato', 'anchovy', 'parmesan', 'miso', 'fish sauce', 'worcestershire', 'kombu', 'bonito', 'truffle', 'cheese', 'beef', 'pork', 'nutritional yeast'],
  Tangy: ['lemon', 'lime', 'vinegar', 'yogurt', 'sour cream', 'tamarind', 'sumac', 'orange', 'grapefruit', 'pickl', 'ferment', 'kimchi', 'buttermilk', 'creme fraiche', 'pomegranate', 'citrus'],
  Fresh: ['basil', 'parsley', 'cilantro', 'mint', 'dill', 'chive', 'cucumber', 'zucchini', 'lettuce', 'spinach', 'arugula', 'celery', 'fennel', 'herb', 'spring onion', 'microgreen', 'watercress'],
};

// eslint-disable-next-line react-refresh/only-export-components
export function scoreRecipe(recipe) {
  const allText = [
    ...(recipe.ingredients || []),
    recipe.name || '',
    recipe.description || '',
  ].join(' ').toLowerCase();
  const name = (recipe.name || '').toLowerCase();
  return Object.entries(FLAVOR_KEYWORDS).map(([flavor, keywords]) => {
    const matches = keywords.filter(k => allText.includes(k)).length;
    let score = Math.min(10, matches * 2.5);
    if (flavor === 'Spicy' && /spicy|hot|fiery|piri|szechuan|devil/.test(name)) score = Math.min(10, score + 3);
    if (flavor === 'Sweet' && /sweet|honey|caramel|dessert|cake|brownie|cookie/.test(name)) score = Math.min(10, score + 3);
    if (flavor === 'Tangy' && /tangy|zesty|citrus|lemon|pickled/.test(name)) score = Math.min(10, score + 2);
    return { flavor, score: Math.max(1, Math.round(score)) };
  });
}

export default function FlavorRadar({ recipe }) {
  const scores = scoreRecipe(recipe);
  const cx = 100, cy = 100, R = 68;
  const n = scores.length;
  const angleStep = (2 * Math.PI) / n;
  const angleOf = (i) => -Math.PI / 2 + i * angleStep;
  const pointAt = (i, r) => ({
    x: cx + r * Math.cos(angleOf(i)),
    y: cy + r * Math.sin(angleOf(i)),
  });
  const hexPath = (r) => {
    const pts = Array.from({ length: n }, (_, i) => pointAt(i, r));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  };
  const dataPath = () => {
    const pts = scores.map((s, i) => pointAt(i, (s.score / 10) * R));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  };

  return (
    <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Flavor Profile</h4>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-[220px]" aria-label="Flavor profile radar chart">
          {[0.33, 0.66, 1].map((pct, ri) => (
            <path key={ri} d={hexPath(R * pct)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}
          {scores.map((_, i) => {
            const p = pointAt(i, R);
            return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />;
          })}
          <path d={dataPath()} fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.7)" strokeWidth="2" strokeLinejoin="round" />
          {scores.map((s, i) => {
            const p = pointAt(i, (s.score / 10) * R);
            return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill="#f97316" />;
          })}
          {scores.map((s, i) => {
            const angle = angleOf(i);
            const labelR = R + 20;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);
            const anchor = lx < cx - 4 ? 'end' : lx > cx + 4 ? 'start' : 'middle';
            return (
              <g key={i}>
                <text x={lx.toFixed(1)} y={(ly - 3).toFixed(1)} textAnchor={anchor} fontSize="7" fill="rgba(255,255,255,0.5)" fontFamily="system-ui,sans-serif">{s.flavor}</text>
                <text x={lx.toFixed(1)} y={(ly + 6).toFixed(1)} textAnchor={anchor} fontSize="7" fill="#f97316" fontFamily="system-ui,sans-serif" fontWeight="bold">{s.score}/10</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
