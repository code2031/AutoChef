import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHLY_PRODUCE = {
  0: { items: ['blood oranges', 'clementines', 'kale', 'leeks', 'parsnips', 'turnips', 'winter squash', 'pomelo'], tip: 'January is perfect for hearty braises and citrus-bright salads.' },
  1: { items: ['grapefruit', 'kale', 'leeks', 'potatoes', 'winter squash', 'kumquats', 'radicchio', 'endive'], tip: 'February citrus is at peak sweetness — use it in dressings and curd.' },
  2: { items: ['artichokes', 'asparagus', 'peas', 'spinach', 'strawberries', 'watercress', 'radishes', 'spring onions'], tip: 'March brings the first spring vegetables — keep preparations light and simple.' },
  3: { items: ['asparagus', 'peas', 'morel mushrooms', 'ramps', 'fiddleheads', 'strawberries', 'artichokes', 'arugula'], tip: 'April asparagus needs nothing more than butter and a squeeze of lemon.' },
  4: { items: ['cherries', 'strawberries', 'zucchini', 'peas', 'broad beans', 'new potatoes', 'mint', 'lettuce'], tip: 'May is the month of tender greens — perfect for vibrant salads and pastas.' },
  5: { items: ['tomatoes', 'corn', 'zucchini', 'blueberries', 'peaches', 'basil', 'cucumbers', 'green beans'], tip: 'June tomatoes are just starting — use them fresh with great olive oil and basil.' },
  6: { items: ['tomatoes', 'corn', 'eggplant', 'peaches', 'raspberries', 'bell peppers', 'basil', 'cucumber'], tip: 'July is grilling season — peak summer veg loves the open flame.' },
  7: { items: ['tomatoes', 'sweet corn', 'figs', 'watermelon', 'eggplant', 'peppers', 'plums', 'blackberries'], tip: 'August tomatoes at their peak — make a big batch of sauce to freeze.' },
  8: { items: ['apples', 'pears', 'butternut squash', 'pomegranate', 'grapes', 'fennel', 'mushrooms', 'arugula'], tip: 'September apple harvest calls for pies, chutneys, and roasted pork.' },
  9: { items: ['pumpkin', 'butternut squash', 'apples', 'pears', 'cranberries', 'sweet potatoes', 'beets', 'kale'], tip: 'October squash is ideal for soups, curries, and stuffed dishes.' },
  10: { items: ['pomegranate', 'cranberries', 'sweet potatoes', 'Brussels sprouts', 'turnips', 'pears', 'chestnuts', 'quince'], tip: 'November Brussels sprouts are best roasted with bacon and balsamic.' },
  11: { items: ['clementines', 'pomegranate', 'parsnips', 'red cabbage', 'chestnuts', 'pears', 'Brussels sprouts', 'leeks'], tip: 'December — embrace warming spices and festive root vegetables.' },
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function SeasonalCalendar({ onClose, onSelectIngredient }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const data = MONTHLY_PRODUCE[month];
  const isCurrentMonth = month === new Date().getMonth();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">🌱 Seasonal Calendar</p>
            <p className="text-sm text-slate-300 mt-0.5 font-semibold">What&apos;s in Season</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <button
            onClick={() => setMonth(m => (m - 1 + 12) % 12)}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-bold text-white">{MONTH_NAMES[month]}</p>
            {isCurrentMonth && <p className="text-xs text-green-400">Current Month</p>}
          </div>
          <button
            onClick={() => setMonth(m => (m + 1) % 12)}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {data.items.map(item => (
              <button
                key={item}
                onClick={() => onSelectIngredient?.(item)}
                className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm hover:bg-green-500/20 transition-all capitalize"
              >
                🌱 {item}
              </button>
            ))}
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wide mb-1">💡 Seasonal Tip</p>
            <p className="text-xs text-slate-300 leading-relaxed">{data.tip}</p>
          </div>

          {onSelectIngredient && (
            <p className="text-xs text-slate-600 text-center">Tap any ingredient to add it to your recipe</p>
          )}
        </div>
      </div>
    </div>
  );
}
