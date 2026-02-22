import React, { useState, useEffect } from 'react';
import { Heart, Share2, Printer, QrCode, RotateCcw, ThumbsUp, ThumbsDown, Image as ImageIcon, Loader2 } from 'lucide-react';

async function encodeRecipeToUrl(recipe) {
  const json = JSON.stringify(recipe);
  const bytes = new TextEncoder().encode(json);
  try {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    const encoded = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const base = window.location.origin + window.location.pathname;
    return `${base}#rc=${encoded}`;
  } catch {
    // Fallback to uncompressed if CompressionStream unavailable
    const encoded = btoa(String.fromCharCode(...bytes));
    const base = window.location.origin + window.location.pathname;
    return `${base}#r=${encoded}`;
  }
}

export default function RecipeActions({
  recipe,
  isSaved,
  rating,
  totalLikes,
  totalDislikes,
  onSave,
  onRegenerate,
  onRegenerateImage,
  onRate,
  isRegenerating,
  isRegeneratingImage,
}) {
  const [showQR, setShowQR] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    encodeRecipeToUrl(recipe).then(setShareUrl);
  }, [recipe]);

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.name, url: shareUrl, text: `Check out this AutoChef recipe: ${recipe.name}!` });
      } catch {
        // Share cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShareMsg('Copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  const handlePrint = () => window.print();

  const qrUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=L&data=${encodeURIComponent(shareUrl)}`
    : '';

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
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">Rate this recipe:</span>
        <button
          onClick={() => onRate('up')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${rating === 'up' ? 'bg-green-500/20 text-green-400' : 'text-slate-500 hover:text-green-400'}`}
        >
          <ThumbsUp size={15} />
          {totalLikes > 0 && <span className="font-bold">{totalLikes}</span>}
        </button>
        <button
          onClick={() => onRate('down')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${rating === 'down' ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-red-400'}`}
        >
          <ThumbsDown size={15} />
          {totalDislikes > 0 && <span className="font-bold">{totalDislikes}</span>}
        </button>
      </div>

      {/* QR Code display */}
      {showQR && (
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl w-fit">
          {qrUrl
            ? <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
            : <div className="w-32 h-32 bg-slate-100 rounded animate-pulse" />
          }
          <p className="text-slate-900 text-sm max-w-[160px]">Scan to open this exact recipe</p>
        </div>
      )}
    </div>
  );
}
