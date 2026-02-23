import React from 'react';

function getCategoryBreakdown(items) {
  const categories = { Produce: 0, Protein: 0, Dairy: 0, Pantry: 0, Other: 0 };
  const produce = ['onion','garlic','tomato','pepper','carrot','potato','spinach','lettuce','broccoli','zucchini','cucumber','avocado','lemon','lime','apple','banana','ginger'];
  const protein = ['chicken','beef','pork','fish','salmon','shrimp','egg','tofu','tempeh','lentil','bean','chickpea'];
  const dairy = ['milk','cheese','butter','cream','yogurt','parmesan','cheddar','mozzarella'];
  const pantry = ['rice','pasta','flour','oil','sugar','honey','soy sauce','stock','bread','noodle','oat','salt'];
  items.forEach(item => {
    const n = item.name.toLowerCase();
    if (produce.some(k => n.includes(k))) categories.Produce++;
    else if (protein.some(k => n.includes(k))) categories.Protein++;
    else if (dairy.some(k => n.includes(k))) categories.Dairy++;
    else if (pantry.some(k => n.includes(k))) categories.Pantry++;
    else categories.Other++;
  });
  return categories;
}

function getExpiryStats(items) {
  const today = new Date();
  today.setHours(0,0,0,0);
  let expired = 0, soonExpiring = 0, good = 0, noDate = 0;
  items.forEach(item => {
    if (!item.expiresAt) { noDate++; return; }
    const exp = new Date(item.expiresAt);
    exp.setHours(0,0,0,0);
    const days = Math.round((exp - today) / 86400000);
    if (days < 0) expired++;
    else if (days <= 3) soonExpiring++;
    else good++;
  });
  return { expired, soonExpiring, good, noDate };
}

const COLORS = { Produce: '#22c55e', Protein: '#f97316', Dairy: '#f59e0b', Pantry: '#3b82f6', Other: '#8b5cf6' };

export default function PantryAnalytics({ pantryItems }) {
  if (!pantryItems || pantryItems.length === 0) return null;
  const cats = getCategoryBreakdown(pantryItems);
  const expiry = getExpiryStats(pantryItems);
  const total = pantryItems.length;
  return (
    <div className='mx-4 mt-3 p-4 bg-slate-800/50 border border-white/5 rounded-2xl space-y-4'>
      <p className='text-xs font-bold text-slate-500 uppercase tracking-widest'>Pantry Analytics</p>
      <div className='space-y-2'>
        {Object.entries(cats).filter(([,v]) => v > 0).map(([cat, count]) => (
          <div key={cat}>
            <div className='flex justify-between mb-0.5'>
              <span className='text-xs text-slate-400'>{cat}</span>
              <span className='text-xs text-slate-500'>{count}</span>
            </div>
            <div className='h-1.5 bg-slate-700 rounded-full overflow-hidden'>
              <div className='h-full rounded-full transition-all duration-700' style={{ width: (count / total * 100) + '%', backgroundColor: COLORS[cat] || '#64748b' }} />
            </div>
          </div>
        ))}
      </div>
      <div className='grid grid-cols-2 gap-2'>
        {expiry.expired > 0 && <div className='p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-center'><p className='text-lg font-bold text-red-400'>{expiry.expired}</p><p className='text-xs text-slate-500'>Expired</p></div>}
        {expiry.soonExpiring > 0 && <div className='p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-center'><p className='text-lg font-bold text-orange-400'>{expiry.soonExpiring}</p><p className='text-xs text-slate-500'>Expiring soon</p></div>}
        {expiry.good > 0 && <div className='p-2 bg-green-500/10 border border-green-500/20 rounded-xl text-center'><p className='text-lg font-bold text-green-400'>{expiry.good}</p><p className='text-xs text-slate-500'>Good</p></div>}
        {expiry.noDate > 0 && <div className='p-2 bg-slate-800 border border-white/5 rounded-xl text-center'><p className='text-lg font-bold text-slate-400'>{expiry.noDate}</p><p className='text-xs text-slate-500'>No expiry</p></div>}
      </div>
    </div>
  );
}