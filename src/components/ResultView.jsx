import React, { useEffect, useRef, useState } from 'react';
import { Flame, BookOpen, Timer, Sparkles, Image as ImageIcon, Loader2, ChefHat, Copy, Download, Check, Play, Pause, ShoppingCart, X, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import StatsBar from './StatsBar.jsx';
import RecipeActions from './RecipeActions.jsx';
import CookingMode from './CookingMode.jsx';
import FlavorRadar from './FlavorRadar.jsx';
import KnifeCutsGuide from './KnifeCutsGuide.jsx';
import PlatingGuide from './PlatingGuide.jsx';
import RegionalVariants from './RegionalVariants.jsx';
import { generateRecipeStory, generateCommonMistakes, generateIngredientPrepTip, generateIngredientSubs } from '../lib/groq.js';
import { getSeasonalIngredients } from '../lib/seasonal.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { categorizeByAisle } from '../lib/shoppingList.js';
function detectTimerSeconds(step) {
  const patterns = [
    /for\s+(\d+)-(\d+)\s+min/i,
    /for\s+(\d+)\s+min/i,
    /(\d+)-(\d+)\s+minutes?/i,
    /(\d+)\s+minutes?/i,
    /(\d+)\s+hour/i,
  ];
  for (const p of patterns) {
    const m = step.match(p);
    if (m) {
      const mins = parseInt(m[2] || m[1]);
      return (p.source.includes("hour") ? mins * 60 : mins) * 60;
    }
  }
  return null;
}

function InlineTimer({ seconds }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [running]);
  const fmt = (s) => Math.floor(s/60)+":"+(s%60).toString().padStart(2,"0");
  return (
    <span onClick={()=>setRunning(v=>!v)} className={(running?"bg-orange-500/20 text-orange-400":"bg-slate-800 text-slate-400 hover:bg-slate-700")+" inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-lg text-xs font-mono cursor-pointer select-none transition-all"}>
      {running?<Pause size={10} />:<Play size={10} />}
      {fmt(timeLeft)}
    </span>
  );
}

const SAFE_TEMPS = {
  chicken:{f:165,c:74},turkey:{f:165,c:74},"ground beef":{f:160,c:71},"ground pork":{f:160,c:71},
  beef:{f:145,c:63},pork:{f:145,c:63},lamb:{f:145,c:63},fish:{f:145,c:63},
  salmon:{f:145,c:63},shrimp:{f:145,c:63},prawns:{f:145,c:63},"egg yolk":{f:160,c:71},
};

function getSafeTempForStep(step) {
  const lower = step.toLowerCase();
  for (const [keyword, temps] of Object.entries(SAFE_TEMPS)) {
    if (lower.includes(keyword)) return { keyword, ...temps };
  }
  return null;
}

const TECHNIQUES = {
  julienne:"Cut into thin matchstick-shaped strips.",
  deglaze:"Add liquid to a hot pan to loosen browned bits.",
  fold:"Gently combine with a spatula to preserve air.",
  blanch:"Briefly boil then immediately plunge into ice water.",
  saute:"Cook quickly in a small amount of hot oil or butter.",
  braise:"Brown first, then slow-cook in a small amount of liquid.",
  mince:"Chop into very tiny, fine pieces.",
  sear:"Cook at high heat to form a brown crust on the surface.",
  simmer:"Cook gently just below boiling point.",
  marinate:"Soak food in a seasoned liquid to add flavour.",
  caramelize:"Cook sugar or onions slowly until golden-brown.",
  reduce:"Boil a liquid to evaporate water and concentrate flavour.",
  render:"Cook fatty meat slowly to melt out the fat.",
  temper:"Gradually add hot liquid to eggs without scrambling.",
  emulsify:"Blend two liquids that do not normally mix.",
  baste:"Spoon or brush pan juices over food while it cooks.",
  parboil:"Partially boil food before finishing another way.",
  dice:"Cut into uniform cubes.",
  chiffonade:"Stack leaves, roll tightly, and slice into thin ribbons.",
  zest:"Grate the outer coloured skin of citrus fruit.",
  flambe:"Pour alcohol over food and ignite briefly.",
  whisk:"Beat rapidly to incorporate air or combine smoothly.",
  steep:"Soak in hot liquid to extract flavour.",
  debone:"Remove bones from meat, poultry, or fish.",
  score:"Make shallow cuts to help marinades penetrate.",
  brunoise:"Very small uniform cubes (3mm).",
};

const KNIFE_CUT_TECHNIQUES = ["julienne","brunoise","chiffonade","dice","mince","bias cut"];

function TechniqueWord({ word, definition, onShowKnifeCut }) {
  const [visible, setVisible] = useState(false);
  const isKnifeCut = KNIFE_CUT_TECHNIQUES.includes(word.toLowerCase());
  return (
    <span className="relative inline" onMouseEnter={()=>setVisible(true)} onMouseLeave={()=>setVisible(false)} onClick={()=>setVisible(v=>!v)}>
      <span className="underline decoration-dotted decoration-slate-500 cursor-help text-slate-200">{word}</span>
      {visible && (
        <span className="absolute z-30 bottom-full left-0 mb-2 w-56 p-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-slate-300 shadow-2xl pointer-events-none leading-relaxed">
          <span className="font-bold text-orange-400 block mb-1">{word}</span>
          {definition}
          {isKnifeCut && onShowKnifeCut && (
            <span className="block mt-1.5 text-orange-400 underline pointer-events-auto cursor-pointer" onClick={(e)=>{e.stopPropagation();onShowKnifeCut(word);}}>see diagram &rarr;</span>
          )}
        </span>
      )}
    </span>
  );
}

function renderStepWithTechniques(text, onShowKnifeCut) {
  const parts = [];
  const techKeys = Object.keys(TECHNIQUES);
  const re = new RegExp("\\b("+techKeys.map(t=>t.replace(/\s+/g,"\\s+")).join("|")+")\\b","gi");
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    const found = match[0];
    const defKey = techKeys.find(k => k.toLowerCase() === found.toLowerCase());
    parts.push(<TechniqueWord key={key++} word={found} definition={TECHNIQUES[defKey]} onShowKnifeCut={onShowKnifeCut} />);
    lastIndex = match.index + found.length;
  }
  if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return parts.length > 0 ? parts : text;
}


function ShoppingListModal({ recipe, onClose }) {
  const [checked, setChecked] = useState({});
  const [copied, setCopied] = useState(false);
  const cats = categorizeByAisle(recipe.ingredients || []);
  const toggle = (ing) => setChecked(prev => ({ ...prev, [ing]: !prev[ing] }));
  const copyList = async () => {
    const lines = Object.entries(cats).flatMap(([cat,ings]) => [cat,...ings.map(i=>"  - "+i),""]);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = (recipe.ingredients || []).length;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingCart size={18} className="text-green-400" />Shopping List</h3>
            <p className="text-xs text-slate-500 mt-0.5">{recipe.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyList} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white transition-all">{copied?<Check size={13} className="text-green-400" />:<Copy size={13} />}{copied?"Copied!":"Copy"}</button>
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
          </div>
        </div>
        <div className="overflow-y-auto p-5 space-y-5">
          {Object.entries(cats).map(([cat,ings]) => (
            <div key={cat}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{cat}</p>
              <div className="space-y-1.5">
                {ings.map(ing => (
                  <label key={ing} className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={!!checked[ing]} onChange={()=>toggle(ing)} className="mt-0.5 accent-orange-500 cursor-pointer" />
                    <span className={(checked[ing]?"line-through text-slate-600":"text-slate-300 group-hover:text-white")+" text-sm transition-all"}>{ing}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {checkedCount > 0 && <div className="px-5 pb-4 text-xs text-slate-500 text-center border-t border-white/5 pt-3">{checkedCount} / {total} items checked</div>}
      </div>
    </div>
  );
}

function extractMiseTasks(steps) {
  const tasks = [];
  const pats = [
    /(?:chop|grate|peel|shred|crush|zest)\s+[^.,;]{3,50}/gi,
    /(?:preheat|heat)\s+(?:oven|pan|grill)[^.,;]{0,40}/gi,
  ];
  (steps || []).forEach(step => {
    pats.forEach(pat => {
      pat.lastIndex = 0;
      const m = step.match(pat);
      if (m) m.forEach(x => { const c = x.trim(); if (c.length < 70) tasks.push(c); });
    });
  });
  return [...new Set(tasks)].slice(0, 10);
}

function MiseTasks({ instructions }) {
  const tasks = extractMiseTasks(instructions || []);
  if (tasks.length === 0) return <p>No prep.</p>;
  return <div>{tasks.map((t,i)=><span key={i}>{t}</span>)}</div>;
}

function IngPrepPopover({ data, recipeName, onClose }) {
  const [subsLoading, setSubsLoading] = useState(false);
  const [subs, setSubs] = useState(null);

  const loadSubs = async () => {
    if (subs !== null || subsLoading || !data.ingName) return;
    setSubsLoading(true);
    try {
      const result = await generateIngredientSubs(data.ingName, recipeName);
      setSubs(result?.subs || []);
    } catch { setSubs([]); }
    setSubsLoading(false);
  };

  if (!data) return null;
  return (
    <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-slate-800 border border-white/10 rounded-xl p-3 shadow-2xl">
      <button onClick={onClose} className="absolute top-2 right-2 text-slate-600 hover:text-slate-400"><X size={12} /></button>
      {data.loading ? (
        <div className="flex items-center gap-2 py-2"><Loader2 size={14} className="animate-spin text-orange-400" /><span className="text-xs text-slate-400">Loading tip...</span></div>
      ) : data.tip ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-orange-400">Prep tip</p>
          <p className="text-xs text-slate-300">{data.tip}</p>
          {data.storage && <p className="text-xs text-slate-400">{data.storage}</p>}
          {data.shelf_life && <p className="text-xs text-slate-500">{data.shelf_life}</p>}
        </div>
      ) : <p className="text-xs text-slate-500">No tip available.</p>}
      {!data.loading && data.ingName && (
        <div className="mt-3 pt-2 border-t border-white/10">
          {subs === null ? (
            <button onClick={loadSubs} disabled={subsLoading} className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
              {subsLoading && <Loader2 size={10} className="animate-spin" />}
              {subsLoading ? 'Loading…' : 'See substitutes →'}
            </button>
          ) : subs.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400">Substitutes</p>
              {subs.map((s, i) => (
                <p key={i} className="text-xs text-slate-400 leading-relaxed"><span className="text-orange-400 font-medium">{s.name}</span>: {s.notes}</p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No substitutes found.</p>
          )}
        </div>
      )}
    </div>
  );
}

function GET_SEASONAL_BADGE(ingText) {
  try {
    const seasonal = getSeasonalIngredients();
    const lower = ingText.toLowerCase();
    return (seasonal.ingredients || []).some(s => lower.includes(s.toLowerCase()));
  } catch { return false; }
}

export default function ResultView({
  recipe, recipeImage, isGenerating, isGeneratingImage, diet, isSaved, isAutoTagging,
  rating, totalLikes, totalDislikes, showCookingMode, setShowCookingMode, isRegeneratingImage,
  onSave, onRegenerate, onRegenerateImage, onRate, onReset, onVariantReady, onSimilar,
  onSaveCookingNotes, allergies, tempUnit, nutritionGoals, pairings, onCookDone, persona,
}) {
  const confettiFired = useRef(false);
  const [checked, setChecked] = useState({});
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [customMultiplier, setCustomMultiplier] = useState("");
  const [copiedIngredients, setCopiedIngredients] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showMise, setShowMise] = useState(false);
  const [showPlating, setShowPlating] = useState(false);
  const [showRegional, setShowRegional] = useState(false);
  const [showKnifeCut, setShowKnifeCut] = useState(null);
  const [recipeStory, setRecipeStory] = useState(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [commonMistakes, setCommonMistakes] = useState(null);
  const [_IsLoadingMistakes, setIsLoadingMistakes] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);
  const [activeIngTip, setActiveIngTip] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pantryOpen, setPantryOpen] = useState(false);
  const [pantryResult, setPantryResult] = useState(null);
  const [showImperial, setShowImperial] = useState(false);
  const [bannedList] = useLocalStorage('pref_banned', []);

  useEffect(() => {
    if (recipe && !isGenerating && !isGeneratingImage && !confettiFired.current) {
      confettiFired.current = true;
      if (!localStorage.getItem("confetti_done")) {
        localStorage.setItem("confetti_done", "1");
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ["#f97316","#ef4444","#fbbf24","#ffffff"] });
      }
    }
  }, [recipe, isGenerating, isGeneratingImage]);

  useEffect(() => {
    confettiFired.current = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setTimeout(() => {
      setChecked({});
      setServingMultiplier(1);
      setCustomMultiplier("");
      setRecipeStory(null);
      setCommonMistakes(null);
      setShowMistakes(false);
      setActiveIngTip(null);
      setIsSpeaking(false);
      setPantryOpen(false);
      setPantryResult(null);
    }, 0);
  }, [recipe?.name]);

  useEffect(() => {
    if (!recipe || isGenerating) return;
    setTimeout(() => {
      setIsLoadingStory(true);
      setIsLoadingMistakes(true);
    }, 0);
    generateRecipeStory(recipe)
      .then(story => setRecipeStory(story))
      .catch(() => {})
      .finally(() => setIsLoadingStory(false));
    generateCommonMistakes(recipe)
      .then(mistakes => setCommonMistakes(mistakes))
      .catch(() => {})
      .finally(() => setIsLoadingMistakes(false));
  }, [recipe?.name, isGenerating]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIngClick = async (ing, index) => {
    if (activeIngTip && activeIngTip.index === index) { setActiveIngTip(null); return; }
    const ingName = ing.split(",")[0].trim().replace(/^[\d./\s]+(cup|tsp|tbsp|oz|lb|g|ml)s?\s*/i,"");
    setActiveIngTip({ index, ingName, loading: true });
    try {
      const result = await generateIngredientPrepTip(ingName);
      setActiveIngTip({ index, ingName, loading: false, ...result });
    } catch { setActiveIngTip({ index, ingName, loading: false, tip: null }); }
  };

  const handleReadAloud = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const lines = [
      recipe.name + ".",
      "Ingredients.",
      ...(recipe.ingredients || []).map(i => i + "."),
      "Instructions.",
      ...(recipe.instructions || []).map((s, i) => `Step ${i + 1}. ${s}`),
    ];
    const utter = new SpeechSynthesisUtterance(lines.join(" "));
    utter.rate = 0.9;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const handlePantryCheck = () => {
    if (pantryOpen) { setPantryOpen(false); return; }
    const rawItems = JSON.parse(localStorage.getItem('pantry_items') || '[]');
    const pantryNames = rawItems.map(i => (typeof i === 'string' ? i : (i.name || '')).toLowerCase());
    const have = [], need = [];
    (recipe.ingredients || []).forEach(ing => {
      const base = ing.toLowerCase().replace(/^[\d./\s]+(cup|tsp|tbsp|oz|lb|g|ml)s?\s*/i, '').split(',')[0].trim();
      const match = pantryNames.some(p => p.includes(base.split(' ')[0]) || base.split(' ')[0].length > 2 && base.split(' ').some(w => w.length > 2 && p.includes(w)));
      (match ? have : need).push(ing);
    });
    setPantryResult({ have, need });
    setPantryOpen(true);
  };

  const toggleCheck = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const effectiveMultiplier = customMultiplier !== "" ? (parseFloat(customMultiplier) || 1) : servingMultiplier;

  const scaleIngredient = (text, mult) => {
    if (mult === 1) return text;
    return text.replace(/(\d+(?:\/\d+)?(?:\.\d+)?)/g, (match) => {
      let num;
      if (match.includes('/')) {
        const [a, b] = match.split('/');
        num = parseFloat(a) / parseFloat(b);
      } else {
        num = parseFloat(match);
      }
      const scaled = num * mult;
      if (scaled === 0.5) return '½';
      if (scaled === 0.25) return '¼';
      if (scaled === 0.75) return '¾';
      if (Number.isInteger(scaled)) return String(scaled);
      return String(Math.round(scaled * 10) / 10);
    });
  };

  const convertIngredient = (text, toImperial) => {
    if (!toImperial) return text;
    return text
      .replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, (_, n) => `${(parseFloat(n) * 2.205).toFixed(1)}lbs`)
      .replace(/(\d+(?:\.\d+)?)\s*g\b/gi, (_, n) => parseFloat(n) >= 10 ? `${(parseFloat(n) / 28.35).toFixed(1)}oz` : `${n}g`)
      .replace(/(\d+(?:\.\d+)?)\s*ml\b/gi, (_, n) => `${(parseFloat(n) / 29.57).toFixed(1)}fl oz`)
      .replace(/(\d+(?:\.\d+)?)\s*l\b/gi, (_, n) => `${(parseFloat(n) * 33.81).toFixed(0)}fl oz`)
      .replace(/(\d+(?:\.\d+)?)\s*cm\b/gi, (_, n) => `${(parseFloat(n) / 2.54).toFixed(1)}"`);
  };

  const isBanned = (ingText) => bannedList.some(b => ingText.toLowerCase().includes(b.toLowerCase()));

  const copyIngList = async () => {
    if (!recipe) return;
    const text = (recipe.ingredients || []).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedIngredients(true);
    setTimeout(() => setCopiedIngredients(false), 2000);
  };

  const downloadRecipe = () => {
    if (!recipe) return;
    const blob = new Blob([
      recipe.name+"\n"+"=".repeat(recipe.name.length)+"\n\n"+recipe.description+"\n",
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = recipe.name.replace(/[^a-z0-9]/gi,"_")+".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const HIGHLIGHT_ALLERGENS = (text) => {
    if (!allergies || allergies.length === 0) return text;
    const aMap = {
      nuts:["nut","almond","peanut","walnut"],dairy:["milk","cheese","butter","cream"],
      eggs:["egg","yolk"],shellfish:["shrimp","crab","lobster"],soy:["soy","tofu"],
    };
    const lower = text.toLowerCase();
    for (const a of allergies) {
      const words = aMap[a] || [a];
      for (const w of words) { if (lower.includes(w)) return { text, allergen: a }; }
    }
    return text;
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="text-orange-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold">Crafting your recipe...</h3>
          <p className="text-slate-400">Creating a masterpiece just for you.</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const multiplierOptions = [0.5, 1, 2, 3];

  return (
    <>
      {showKnifeCut && <KnifeCutsGuide cut={showKnifeCut} onClose={()=>setShowKnifeCut(null)} />}
      {showPlating && recipe && <PlatingGuide recipe={recipe} onClose={()=>setShowPlating(false)} />}
      {showRegional && recipe && <RegionalVariants recipe={recipe} onClose={()=>setShowRegional(false)} />}

      {showCookingMode && (
        <CookingMode
          recipe={recipe}
          onCookDone={onCookDone}
          onExit={(notes) => {
            setShowCookingMode(false);
            if (onSaveCookingNotes && notes && Object.keys(notes).length > 0) onSaveCookingNotes(notes);
          }}
        />
      )}

      {showMise && recipe && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-sm flex flex-col p-4 sm:p-6">
          <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Mise en Place</p>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">Prep before you cook</h2>
              </div>
              <button onClick={()=>setShowMise(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>
            <MiseTasks instructions={recipe.instructions} />
            <button onClick={()=>{setShowMise(false);setShowCookingMode(true);}} className="mt-6 w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-lg transition-all">
              Start Cooking &rarr;
            </button>
          </div>
        </div>
      )}

      {showShoppingList && <ShoppingListModal recipe={recipe} onClose={()=>setShowShoppingList(false)} />}

      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="recipe-hero w-full h-48 sm:h-64 md:h-96 rounded-3xl overflow-hidden relative bg-slate-900 border border-white/10">
          {recipeImage && <img src={recipeImage} alt={recipe.name} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000" />}
          {isGeneratingImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 space-y-4 no-print">
              <div className="text-orange-500 animate-bounce"><ImageIcon size={32} /></div>
              <p className="text-slate-400 font-medium flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Rendering your dish...</p>
            </div>
          )}
          {!recipeImage && !isGeneratingImage && (
            <div className="absolute inset-0 flex items-center justify-center no-print">
              <ImageIcon size={48} className="text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none no-print" />
          <div className="absolute bottom-6 left-6 right-6 no-print">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg">{recipe.name}</h2>
          </div>
        </div>
        <h2 className="hidden print-only text-3xl font-black text-black">{recipe.name}</h2>

        <RecipeActions
          recipe={recipe}
          recipeImage={recipeImage}
          isSaved={isSaved}
          isAutoTagging={isAutoTagging}
          rating={rating}
          totalLikes={totalLikes}
          totalDislikes={totalDislikes}
          onSave={onSave}
          onRegenerate={onRegenerate}
          onRegenerateImage={onRegenerateImage}
          onRate={onRate}
          onDownload={downloadRecipe}
          onVariantReady={onVariantReady}
          onSimilar={onSimilar}
          onShoppingList={()=>setShowShoppingList(true)}
          isRegeneratingImage={isRegeneratingImage}
          persona={persona}
          onShowPlating={()=>setShowPlating(true)}
          onShowRegional={()=>setShowRegional(true)}
        />

        <div className="space-y-4">
          <p className="text-slate-300 italic text-lg leading-relaxed">{recipe.description}</p>
          {isLoadingStory && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={12} className="animate-spin" />Loading story...</div>}
          {recipeStory && !isLoadingStory && (
            <blockquote className="border-l-4 border-orange-500/40 pl-4 py-1 text-slate-400 italic text-sm leading-relaxed">{recipeStory}</blockquote>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>setShowMise(true)} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20">
              <ChefHat size={16} />Start Cooking Mode
            </button>
            {window.speechSynthesis && (
              <button onClick={handleReadAloud} className={"flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border "+(isSpeaking?"bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30":"bg-slate-800 border-white/10 text-slate-400 hover:text-white")}>
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
              </button>
            )}
          </div>
        </div>

        <div>
          <StatsBar recipe={recipe} diet={diet} tempUnit={tempUnit} nutritionGoals={nutritionGoals} />
        </div>
        <div>
          <FlavorRadar recipe={recipe} />
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="border-b border-white/5 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-bold text-lg"><BookOpen size={18} className="text-orange-500" />Ingredients</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowImperial(v => !v)}
                      className="text-xs px-2.5 py-1 bg-slate-800 border border-white/10 text-slate-400 rounded-lg hover:border-white/20 hover:text-white transition-all"
                      title="Toggle measurement units"
                    >
                      {showImperial ? '🔄 Metric' : '🔄 Imperial'}
                    </button>
                    <button onClick={handlePantryCheck} className={"px-2.5 py-1 rounded-lg text-xs font-medium transition-all "+(pantryOpen?"bg-green-500/20 text-green-400":"text-slate-500 hover:text-white bg-slate-800")}>🧺 Pantry</button>
                    <button onClick={copyIngList} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-all">{copiedIngredients?<Check size={14} className="text-green-400" />:<Copy size={14} />}</button>
                  </div>
                </div>
                {pantryOpen && pantryResult && (
                  <div className="rounded-xl border border-white/5 overflow-hidden text-xs">
                    {pantryResult.have.length > 0 && (
                      <div className="bg-green-500/10 px-3 py-2 space-y-1">
                        <p className="font-bold text-green-400">✅ You have ({pantryResult.have.length})</p>
                        {pantryResult.have.map((i, idx) => <p key={idx} className="text-slate-400 pl-2">{i}</p>)}
                      </div>
                    )}
                    {pantryResult.need.length > 0 && (
                      <div className="bg-orange-500/5 px-3 py-2 space-y-1">
                        <p className="font-bold text-orange-400">🛒 Need to buy ({pantryResult.need.length})</p>
                        {pantryResult.need.map((i, idx) => <p key={idx} className="text-slate-400 pl-2">{i}</p>)}
                      </div>
                    )}
                    {pantryResult.have.length === 0 && pantryResult.need.length === 0 && (
                      <p className="px-3 py-2 text-slate-500">No pantry items to compare against.</p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 flex-wrap">
                  {multiplierOptions.map(m => (
                    <button key={m} onClick={()=>{setServingMultiplier(m);setCustomMultiplier("");}} className={(effectiveMultiplier===m&&customMultiplier===""?"bg-orange-500 text-white":"bg-slate-800 text-slate-400 hover:text-white border border-white/10")+" px-3 py-1 rounded-lg text-xs font-bold transition-all"}>{m===0.5?"½x":m+"x"}</button>
                  ))}
                  <input type="number" value={customMultiplier} onChange={e=>{setCustomMultiplier(e.target.value);setServingMultiplier(1);}} placeholder="×?" className="w-12 bg-slate-800 border border-white/10 rounded-lg text-xs text-center text-slate-300 outline-none py-1" min="0.1" max="20" step="0.5" />
                  {effectiveMultiplier !== 1 && <span className="text-xs text-orange-400 font-medium">{effectiveMultiplier}× qty</span>}
                </div>
              </div>
              <ul className="space-y-3">
                {(recipe.ingredients || []).map((item, i) => {
                  const displayItem = convertIngredient(scaleIngredient(item, effectiveMultiplier), showImperial);
                  return (
                    <li key={i} className="relative">
                      <div className={(checked[i]?"line-through text-slate-600":"text-slate-300")+" flex gap-2 text-sm cursor-pointer"} onClick={()=>toggleCheck(i)}>
                        <span className={(checked[i]?"bg-slate-600":"bg-orange-500")+" w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"} />
                        <span className="flex-1" onClick={e=>{e.stopPropagation();handleIngClick(item,i);}}>{displayItem}</span>
                        {GET_SEASONAL_BADGE(item) && <span className="text-green-400 text-[10px] font-bold shrink-0 self-center" title="In season now">🌱</span>}
                        {isBanned(item) && (
                          <span className="ml-1 text-xs px-1.5 py-0.5 bg-red-500/15 border border-red-500/20 text-red-400 rounded-full" title={`You've banned an ingredient in this dish. Check smartSub: ${recipe.smartSub || 'see substitutions'}`}>
                            ⚠️ banned
                          </span>
                        )}
                      </div>
                      {activeIngTip && activeIngTip.index===i && <IngPrepPopover data={activeIngTip} recipeName={recipe.name} onClose={()=>setActiveIngTip(null)} />}
                    </li>
                  );
                })}
              </ul>
              {Object.values(checked).some(Boolean) && <p className="text-xs text-slate-500">{Object.values(checked).filter(Boolean).length} / {(recipe.ingredients||[]).length} checked</p>}
            </div>
            <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Smart Substitution</h4>
              <p className="text-sm text-slate-300">{recipe.smartSub}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-5">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6">
              <h4 className="flex items-center gap-2 font-bold text-lg border-b border-white/5 pb-2">
                <Timer size={18} className="text-orange-500" />
                Instructions
                <span className="text-xs font-normal text-slate-500 ml-auto">Underlined terms have tips</span>
              </h4>
              <div className="space-y-5">
                {(recipe.instructions || []).map((stepText, i) => {
                  const timerSecs = detectTimerSeconds(stepText);
                  const temp = getSafeTempForStep(stepText);
                  return (
                    <div key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-500 text-sm border border-white/5">{i+1}</span>
                      <p className="text-slate-300 leading-relaxed pt-1">
                        {renderStepWithTechniques(stepText, setShowKnifeCut)}
                        {timerSecs && <InlineTimer key={recipe.name+"-"+i} seconds={timerSecs} />}
                        {temp && (
                          <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-mono whitespace-nowrap">
                            🌡️ {tempUnit==="F"?temp.f+"°F":temp.c+"°C"} safe temp
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {commonMistakes && commonMistakes.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
                <button onClick={()=>setShowMistakes(v=>!v)} className="w-full flex items-center justify-between p-4 text-sm font-bold text-red-400">
                  <span>Common Mistakes</span>
                  {showMistakes?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
                </button>
                {showMistakes && commonMistakes && (
                  <ul className="px-4 pb-4 space-y-2">
                    {commonMistakes.map((m,i)=><li key={i} className="text-xs text-slate-400">{m.mistake}: {m.fix}</li>)}
                  </ul>
                )}
              </div>
            )}

            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
              <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-sm text-blue-400">Chef&apos;s Pro Tip</h4>
                <p className="text-sm text-slate-300 italic">{recipe.chefTip}</p>
              </div>
            </div>
          </div>
        </div>

        {pairings && pairings.length > 0 && (
          <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Goes Well With</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              {pairings.map((p, i) => (
                <div key={i} className="p-3 bg-slate-800/50 border border-white/5 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-orange-400 uppercase">{p.type}</span>
                  <p className="font-bold text-sm text-white">{p.name}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onReset} className="text-slate-500 text-sm hover:text-white transition-colors">&larr; Cook something else</button>
      </div>
    </>
  );
}
