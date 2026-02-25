import React from 'react';

// Feature 34: SVG donut chart for protein / carbs / fat macros
const MACRO_COLORS = {
  protein: '#3b82f6',
  carbs: '#f59e0b',
  fat: '#a855f7',
  fiber: '#22c55e',
};

const MACRO_LABELS = {
  protein: 'Protein',
  carbs: 'Carbs',
  fat: 'Fat',
  fiber: 'Fiber',
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

export default function MacroPieChart({ nutrition, className = '' }) {
  if (!nutrition) return null;

  const macros = ['protein', 'carbs', 'fat', 'fiber'].map(k => ({
    key: k,
    value: parseFloat(nutrition[k]) || 0,
    color: MACRO_COLORS[k],
    label: MACRO_LABELS[k],
  })).filter(m => m.value > 0);

  const total = macros.reduce((s, m) => s + m.value, 0);
  if (total === 0) return null;

  const cx = 60, cy = 60, r = 44, innerR = 26;
  let angle = 0;
  const slices = macros.map(m => {
    const sweep = (m.value / total) * 360;
    const slice = { ...m, startAngle: angle, endAngle: angle + sweep };
    angle += sweep;
    return slice;
  });

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0">
        {slices.map((s, i) => (
          <path
            key={i}
            d={describeArc(cx, cy, r, s.startAngle, s.endAngle - 0.5)}
            fill="none"
            stroke={s.color}
            strokeWidth={innerR}
            strokeLinecap="butt"
          />
        ))}
        {/* Inner ring */}
        <circle cx={cx} cy={cy} r={innerR - 9} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">
          {Math.round(total)}g
        </text>
      </svg>
      <div className="space-y-1.5 min-w-0">
        {macros.map(m => (
          <div key={m.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
            <span className="text-xs text-slate-400 w-12 shrink-0">{m.label}</span>
            <span className="text-xs font-bold text-slate-200">{m.value}g</span>
            <span className="text-xs text-slate-600">({Math.round((m.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
