import React, { useState } from 'react';
import { Copy, Check, Mail, Printer } from 'lucide-react';

// Feature 45: Compact share bar with Web Share API, WhatsApp, Email, Print, Copy-name
export default function QuickShareBar({ recipe }) {
  const [copiedName, setCopiedName] = useState(false);

  const copyName = async () => {
    if (!recipe?.name) return;
    await navigator.clipboard.writeText(recipe.name);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
  };

  const shareRecipe = async () => {
    if (!recipe) return;
    const text = `${recipe.name}\n\n${recipe.description || ''}\n\nIngredients:\n${(recipe.ingredients || []).map(i => '• ' + i).join('\n')}\n\nGenerated with AutoChef`;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.name, text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const emailRecipe = () => {
    if (!recipe) return;
    const subject = encodeURIComponent(`Recipe: ${recipe.name}`);
    const body = encodeURIComponent(
      `${recipe.name}\n\n${recipe.description || ''}\n\nIngredients:\n${(recipe.ingredients || []).map(i => '• ' + i).join('\n')}\n\nInstructions:\n${(recipe.instructions || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n— Shared from AutoChef`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const whatsappShare = () => {
    if (!recipe) return;
    const text = encodeURIComponent(`🍳 ${recipe.name}\n\n${recipe.description || ''}\n\nMade with AutoChef!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const printRecipe = () => window.print();

  const readingTime = () => {
    if (!recipe) return null;
    const words = (recipe.instructions || []).join(' ').split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return mins;
  };

  const rt = readingTime();

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      {rt && (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          📖 {rt} min read
        </span>
      )}
      <div className="flex items-center gap-1 ml-auto">
        {/* Copy name */}
        <button
          onClick={copyName}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Copy recipe name"
        >
          {copiedName ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          {copiedName ? 'Copied!' : 'Copy name'}
        </button>

        {/* Web Share / clipboard */}
        <button
          onClick={shareRecipe}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title={navigator.share ? 'Share recipe' : 'Copy recipe text'}
        >
          🔗 {navigator.share ? 'Share' : 'Copy'}
        </button>

        {/* WhatsApp */}
        <button
          onClick={whatsappShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-green-400 hover:bg-green-500/5 transition-all"
          title="Share on WhatsApp"
        >
          💬 WhatsApp
        </button>

        {/* Email */}
        <button
          onClick={emailRecipe}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all"
          title="Email recipe"
        >
          <Mail size={13} /> Email
        </button>

        {/* Print */}
        <button
          onClick={printRecipe}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Print recipe"
        >
          <Printer size={13} /> Print
        </button>
      </div>
    </div>
  );
}
