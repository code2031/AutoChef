import React from 'react';

export default function SelectorGroup({ label, options, value, onChange, multi = false }) {
  const isSelected = (opt) =>
    multi ? (Array.isArray(value) && value.includes(opt.value)) : value === opt.value;

  const handleClick = (opt) => {
    if (multi) {
      if (!Array.isArray(value)) { onChange([opt.value]); return; }
      onChange(
        value.includes(opt.value)
          ? value.filter(v => v !== opt.value)
          : [...value, opt.value]
      );
    } else {
      onChange(opt.value);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleClick(opt)}
            className={`px-3 py-2 rounded-xl border text-sm transition-all ${
              isSelected(opt)
                ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
            }`}
          >
            {opt.icon && <span className="mr-1">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
