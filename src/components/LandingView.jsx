import React from 'react';
import { ArrowRight, Sparkles, Camera, Heart } from 'lucide-react';
import { getSeasonalIngredients } from '../lib/seasonal.js';
import logoUrl from '../assets/AutoChef_Logo.png';

export default function LandingView({ setView }) {
  const seasonal = getSeasonalIngredients();

  const features = [
    { icon: <Camera size={20} className="text-blue-400" />, title: 'AI Fridge Scan', desc: 'Snap a photo; our vision model lists every ingredient.' },
    { icon: <Sparkles size={20} className="text-orange-400" />, title: 'Instant Recipes', desc: 'Groq Llama 3.3 70B crafts a gourmet recipe in seconds.' },
    { icon: <Heart size={20} className="text-pink-400" />, title: 'Save & Revisit', desc: 'Favourite recipes persist across sessions.' },
  ];

  return (
    <div className="flex flex-col items-center text-center py-16 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">
          <Sparkles size={14} /> {seasonal.label} seasonal picks: {seasonal.ingredients.slice(0, 3).join(', ')}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Intelligent Cooking,<br />
          <span className="text-orange-500">Effortless Living.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Snap a photo of your fridge. Our AI identifies ingredients and invents a gourmet recipe — complete with a food photo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setView('generate')}
            className="group relative px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center gap-2 shadow-2xl shadow-orange-500/20"
          >
            Start Cooking
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 w-full max-w-2xl">
        {features.map((f, i) => (
          <div key={i} className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl text-left space-y-2 hover:border-orange-500/20 transition-all">
            <div className="p-2 bg-white/5 rounded-xl w-fit">{f.icon}</div>
            <h3 className="font-bold text-sm">{f.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
