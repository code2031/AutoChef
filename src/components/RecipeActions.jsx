import React, { useState } from 'react';
import { Heart, Share2, Printer, QrCode, RotateCcw, ThumbsUp, ThumbsDown, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function RecipeActions({
  recipe,
  isSaved,
  rating,
  onSave,
  onRegenerate,
  onRegenerateImage,
  onRate,
  isRegenerating,
  isRegeneratingImage,
}) {
  const [showQR, setShowQR] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const handleShare = async () => {
    const text = `Check out this AutoChef recipe: ${recipe.name}!\n${recipe.description}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.name, text });
      } catch {
        // Share cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(text);
      setShareMsg('Copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  const handlePrint = () => window.print();

  const qrData = encodeURIComponent(window.location.href);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  return (
    <div className="space-y-3 no-print">
      <div className="flex flex-wrap gap-2">
        {/* Save / Favourite */}
        <button
          onClick={onSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            isSaved
              ? 'bg-pink-500/10 border-pink-500/40 text-pink-400'
              : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
          }`}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'Saved' : 'Save'}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-white/20 transition-all"
        >
          <Share2 size={16} />
          {shareMsg || 'Share'}
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-white/20 transition-all"
        >
          <Printer size={16} />
          Print
        </button>

        {/* QR Code */}
        <button
          onClick={() => setShowQR(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showQR ? 'bg-slate-800 border-white/20 text-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'}`}
        >
          <QrCode size={16} />
          QR
        </button>

        {/* Regenerate Recipe */}
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-orange-500/30 hover:text-orange-400 transition-all disabled:opacity-50"
        >
          {isRegenerating ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
          New Recipe
        </button>

        {/* Regenerate Image */}
        <button
          onClick={onRegenerateImage}
          disabled={isRegeneratingImage}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-blue-500/30 hover:text-blue-400 transition-all disabled:opacity-50"
        >
          {isRegeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          New Image
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Rate this recipe:</span>
        <button
          onClick={() => onRate('up')}
          className={`p-2 rounded-lg transition-all ${rating === 'up' ? 'bg-green-500/20 text-green-400' : 'text-slate-500 hover:text-green-400'}`}
        >
          <ThumbsUp size={16} />
        </button>
        <button
          onClick={() => onRate('down')}
          className={`p-2 rounded-lg transition-all ${rating === 'down' ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-red-400'}`}
        >
          <ThumbsDown size={16} />
        </button>
      </div>

      {/* QR Code display */}
      {showQR && (
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl w-fit">
          <img src={qrUrl} alt="QR Code" className="w-24 h-24" />
          <p className="text-slate-900 text-sm max-w-[160px]">Scan to share this page</p>
        </div>
      )}
    </div>
  );
}
