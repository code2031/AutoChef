import React, { useState } from 'react';
import { Clock, Utensils, Flame, Leaf, Users, Wine, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { estimateCost } from '../lib/costs.js';
import { getCarbonScore } from '../lib/carbon.js';
const DIFFICULTY_INFO = {
  Easy: 'Beginner-friendly. Simple techniques, few steps, forgiving timing.',
  Medium: 'Some experience helpful. Requires attention to timing and technique.',
  Hard: 'Advanced skills needed. Complex techniques, precise timing, more steps.',
};

const ANTI_INFLAM_GOOD = ['turmeric','ginger','salmon','blueberries','olive oil','walnuts','avocado','spinach','broccoli','garlic','berries','chia','flaxseed'];
const ANTI_INFLAM_BAD = ['white sugar','refined flour','vegetable oil','canola oil','margarine','processed meat','corn syrup'];
const LOW_GI = ['lentil','chickpea','bean','sweet potato','oat','barley','quinoa','brown rice','yogurt'];
const HIGH_GI = ['white rice','white bread','potato','pasta','cornflakes','white sugar','watermelon'];
const HYDRATING = ['cucumber','watermelon','tomato','lettuce','celery','zucchini','broth','stock','soup','coconut water'];
const EQUIP_KW=["knife","pan","skillet","pot","saucepan","mixing bowl","whisk","spatula","colander","blender","tongs","ladle","peeler","grater","wok","oven","grill"];
const EQUIP_ICONS={knife:"🔪",pan:"🍳",skillet:"🍳",pot:"🫕",saucepan:"🫕","mixing bowl":"🥣",whisk:"🥄",spatula:"🥄",colander:"🫙",blender:"🫙",tongs:"🤏",ladle:"🥄",peeler:"🔪",grater:"🔩",wok:"🍳",oven:"♨️",grill:"🔥"};

function getAntiInflamScore(items) {
  const t=items.join(" ").toLowerCase();
  const good=ANTI_INFLAM_GOOD.filter(k=>t.includes(k)).length;
  const bad=ANTI_INFLAM_BAD.filter(k=>t.includes(k)).length;
  const s=good-bad;
  if(s>=3) return {label:"Anti-Inflam",color:"#22c55e",tooltip:good+" anti-inflammatory item(s)"};
  if(s>=1) return {label:"Moderate",color:"#f59e0b",tooltip:"Some anti-inflammatory items"};
  if(bad>0) return {label:"Pro-Inflam",color:"#ef4444",tooltip:bad+" pro-inflammatory item(s)"};
  return null;
}

function getGIScore(items) {
  const t=items.join(" ").toLowerCase();
  const low=LOW_GI.filter(k=>t.includes(k)).length;
  const high=HIGH_GI.filter(k=>t.includes(k)).length;
  if(low>high) return {label:"Low GI",color:"#22c55e",tooltip:"Low glycemic: "+low+" items"};
  if(high>low) return {label:"High GI",color:"#ef4444",tooltip:"High glycemic: "+high+" items"};
  if(low>0||high>0) return {label:"Medium GI",color:"#f59e0b",tooltip:"Mixed glycemic index"};
  return null;
}

function getHydrationScore(items) {
  const t=items.join(" ").toLowerCase();
  const c=HYDRATING.filter(k=>t.includes(k)).length;
  return c>=2?c:null;
}

function getComplexityScore(ings, instructions, equipment) {
  const score = Math.min(100, ings.length * 2 + (instructions||[]).length * 2 + equipment.length * 4);
  if (score <= 20) return { label: 'Simple', color: '#22c55e' };
  if (score <= 45) return { label: 'Moderate', color: '#f59e0b' };
  if (score <= 70) return { label: 'Complex', color: '#f97316' };
  return { label: 'Expert', color: '#ef4444' };
}

function getCalorieBurn(calories) {
  const cal = parseInt(calories);
  if (!cal || cal <= 0) return null;
  return {
    walk: Math.round(cal / 4.3),
    run: Math.round(cal / 9.8),
    cycle: Math.round(cal / 7.4),
  };
}

function detectEquipment(instructions) {
  const t=(instructions||[]).join(" ").toLowerCase();
  const found=[];
  EQUIP_KW.forEach(eq=>{ if(t.includes(eq)&&!found.includes(eq)) found.push(eq); });
  return found;
}

function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={()=>setVisible(true)} onMouseLeave={()=>setVisible(false)}>
      {children}
      {visible && (
        <span className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-slate-300 shadow-xl pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}

function MacroBar({ label, value, color, goal }) {
  const num = parseInt(value) || 0;
  const goalNum = goal ? parseInt(goal) : null;
  const max = goalNum || (label==='carbs'?80:label==='protein'?60:label==='fat'?50:30);
  const pct = Math.min(100, Math.round((num/max)*100));
  const overGoal = goalNum && num > goalNum;
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={"text-xs font-bold "+(overGoal?"text-red-400":"text-slate-300")}>{value||"—"}{goalNum?" / "+goal:""}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{width:pct+"%",backgroundColor:overGoal?"#ef4444":color}} />
      </div>
    </div>
  );
}

export default function StatsBar({ recipe, diet, nutritionGoals }) {
  const [showEquipment, setShowEquipment] = useState(false);
  const [showBurn, setShowBurn] = useState(false);
  const ings = recipe.ingredients || [];
  const costInfo = ings.length>0 ? estimateCost(ings) : null;
  const carbonInfo = ings.length>0 ? getCarbonScore(ings) : null;
  const antiInflam = ings.length>0 ? getAntiInflamScore(ings) : null;
  const giScore = ings.length>0 ? getGIScore(ings) : null;
  const hydration = ings.length>0 ? getHydrationScore(ings) : null;
  const equipment = detectEquipment(recipe.instructions);
  const complexity = getComplexityScore(ings, recipe.instructions, equipment);
  const burn = getCalorieBurn(recipe.calories);
  const stats = [
    recipe.prepTime && { icon: <Clock size={16} className="text-blue-400" />, label: "Prep", value: recipe.prepTime },
    recipe.cookTime && { icon: <Clock size={16} className="text-orange-500" />, label: "Cook", value: recipe.cookTime },
    !recipe.prepTime && { icon: <Clock size={18} className="text-orange-500" />, label: "Time", value: recipe.time },
    { icon: <Utensils size={18} className="text-orange-500" />, label: "Difficulty", value: recipe.difficulty, tooltip: DIFFICULTY_INFO[recipe.difficulty] },
    { icon: <Flame size={18} className="text-orange-500" />, label: "Calories", value: recipe.calories, subLabel: "per serving" },
    { icon: <Leaf size={18} className="text-orange-500" />, label: "Type", value: diet==='none'?'Standard':diet },
    { icon: <Users size={18} className="text-orange-500" />, label: "Servings", value: recipe.servings||'2' },
    recipe.winePairing && { icon: <Wine size={18} className="text-orange-500" />, label: "Pairs With", value: recipe.winePairing },
    costInfo && { icon: <DollarSign size={18} className="text-green-400" />, label: "Est. Cost", value: `~$${costInfo.total}`, tooltip: "Estimated cost per batch" },
    carbonInfo && { icon: <span className="text-base">{carbonInfo.icon}</span>, label: "Carbon", value: carbonInfo.label, tooltip: "CO2 footprint", valueColor: carbonInfo.color },
    antiInflam && { icon: <span>🌿</span>, label: "Inflam.", value: antiInflam.label, tooltip: antiInflam.tooltip, valueColor: antiInflam.color },
    giScore && { icon: <span>📊</span>, label: "GI", value: giScore.label, tooltip: giScore.tooltip, valueColor: giScore.color },
    hydration && { icon: <span>💧</span>, label: "Hydrating", value: hydration+" items", tooltip: "High-water items", valueColor: "#38bdf8" },
    { icon: <span>🎯</span>, label: "Complexity", value: complexity.label, valueColor: complexity.color, tooltip: `${ings.length} ingredients · ${(recipe.instructions||[]).length} steps · ${equipment.length} tools` },
  ].filter(Boolean);
  const goals = nutritionGoals || {};
  const hasGoals = goals.calories || goals.protein || goals.carbs || goals.fat;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-white/5 text-center space-y-1">
            <div className="flex justify-center">{s.icon}</div>
            <span className="block text-xs uppercase text-slate-500 font-bold tracking-widest">{s.label}</span>
            {s.tooltip ? (
              <Tooltip text={s.tooltip}>
                <span className="text-sm font-medium capitalize leading-tight underline decoration-dotted cursor-help" style={s.valueColor?{color:s.valueColor}:{}}>{s.value}</span>
              </Tooltip>
            ) : (
              <span className="text-sm font-medium capitalize leading-tight block" style={s.valueColor?{color:s.valueColor}:{}}>{s.value}</span>
            )}
            {s.subLabel && <span className="block text-[10px] text-slate-600">{s.subLabel}</span>}
          </div>
        ))}
      </div>
      {recipe.nutrition && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MacroBar label="protein" value={recipe.nutrition.protein} color="#22c55e" goal={goals.protein} />
          <MacroBar label="carbs" value={recipe.nutrition.carbs} color="#f59e0b" goal={goals.carbs} />
          <MacroBar label="fat" value={recipe.nutrition.fat} color="#f97316" goal={goals.fat} />
          <MacroBar label="fiber" value={recipe.nutrition.fiber} color="#06b6d4" />
        </div>
      )}
      {hasGoals && <p className="text-xs text-slate-600">* Bars show recipe vs daily goals. Red = over goal.</p>}
      {equipment.length > 0 && (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
          <button onClick={()=>setShowEquipment(v=>!v)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">
            <span>🍴 Equipment Needed ({equipment.length})</span>
            {showEquipment ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showEquipment && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {equipment.map(eq => (
                <span key={eq} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-white/5 rounded-xl text-xs text-slate-300 capitalize">
                  <span>{EQUIP_ICONS[eq]||"🍴"}</span>
                  {eq}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {burn && (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
          <button onClick={()=>setShowBurn(v=>!v)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">
            <span>🏃 Calorie Burn (avg 70 kg)</span>
            {showBurn ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showBurn && (
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {[{icon:"🚶",label:"Walk",min:burn.walk},{icon:"🚴",label:"Cycle",min:burn.cycle},{icon:"🏃",label:"Run",min:burn.run}].map(a=>(
                <div key={a.label} className="text-center p-2 bg-slate-800 rounded-xl">
                  <p className="text-base">{a.icon}</p>
                  <p className="text-base font-bold text-orange-400">{a.min}</p>
                  <p className="text-[10px] text-slate-500">min · {a.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
