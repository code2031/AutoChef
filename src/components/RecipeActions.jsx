import React, { useState, useEffect } from 'react';
import { Heart, Share2, Printer, QrCode, RotateCcw, ThumbsUp, ThumbsDown, Image as ImageIcon, Loader2, Download, Code, MessageSquare, Languages, Leaf, DollarSign, ChevronDown, ShoppingCart, Shuffle, BookOpen, Flame, CreditCard } from 'lucide-react';
import { generateVariant } from '../lib/groq.js';
import { buildVariantPrompt } from '../lib/prompts.js';

async function buildLongUrl(recipe, imageUrl) {
  const payload = JSON.stringify({ r: recipe, i: imageUrl || '' });
  const bytes = new TextEncoder().encode(payload);
  const base = window.location.origin + window.location.pathname;
  try {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    const encoded = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return `${base}?rc=${encodeURIComponent(encoded)}`;
  } catch {
    const encoded = btoa(String.fromCharCode(...bytes));
    return `${base}?r=${encodeURIComponent(encoded)}`;
  }
}

async function shortenUrl(longUrl) {
  const res = await fetch(
    `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`
  );
  const data = await res.json();
  if (!data.shorturl) throw new Error('no shorturl');
  return data.shorturl;
}

export default function RecipeActions({
  recipe,
  recipeImage,
  isSaved,
  isAutoTagging,
  rating,
  totalLikes,
  totalDislikes,
  onSave,
  onRegenerate,
  onRegenerateImage,
  onRate,
  onDownload,
  isRegeneratingImage,
  onVariantReady,
  onSimilar,
  onShoppingList,
}) {
  const [showQR, setShowQR] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [qrShortUrl, setQrShortUrl] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const [variantLoading, setVariantLoading] = useState('');
  const [embedCopied, setEmbedCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => {
    buildLongUrl(recipe, recipeImage).then(async (longUrl) => {
      setShareUrl(longUrl);
      window.history.replaceState(null, '', longUrl);
      try {
        const short = await shortenUrl(longUrl);
        setQrShortUrl(short);
      } catch {
        setQrShortUrl(longUrl);
      }
    });
  }, [recipe, recipeImage]);

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.name, url: shareUrl, text: `Check out this AutoChef recipe: ${recipe.name}!` });
      } catch {
        // Share cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShareMsg('Copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  const handlePrint = () => window.print();

  const handleCopyCaption = async () => {
    const caption = `Just made ${recipe.name} with AutoChef AI! ${recipe.description} #AutoChef #AIRecipe #Cooking ${shareUrl ? `\n${qrShortUrl || shareUrl}` : ''}`;
    await navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleCopyEmbed = async () => {
    if (!shareUrl) return;
    const embedHtml = `<iframe src="${shareUrl}" width="600" height="500" style="border:none;border-radius:16px;" title="${recipe.name} - AutoChef Recipe"></iframe>`;
    await navigator.clipboard.writeText(embedHtml);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  const handleVariant = async (variantType) => {
    if (!onVariantReady) return;
    setVariantLoading(variantType);
    try {
      const prompt = buildVariantPrompt(recipe, variantType);
      const result = await generateVariant(prompt);
      onVariantReady(result);
    } catch {
      // ignore
    } finally {
      setVariantLoading('');
    }
  };

  const handleExportCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Dark background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 800, 500);

    // Orange accent bar
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, 0, 8, 500);

    // Draw recipe image if available
    if (recipeImage) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = recipeImage; });
        ctx.drawImage(img, 300, 0, 500, 500);
        // Gradient overlay over image
        const grad = ctx.createLinearGradient(300, 0, 800, 0);
        grad.addColorStop(0, 'rgba(2,6,23,1)');
        grad.addColorStop(0.3, 'rgba(2,6,23,0.6)');
        grad.addColorStop(1, 'rgba(2,6,23,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(300, 0, 500, 500);
      } catch { /* image failed */ }
    }

    // Recipe name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    const name = recipe.name || 'Recipe';
    // Wrap long names
    const words = name.split(' ');
    let line = '';
    let y = 80;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 270 && line) {
        ctx.fillText(line.trim(), 30, y);
        line = word + ' ';
        y += 40;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), 30, y);

    // Stats
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('⏱ ' + (recipe.time || '—'), 30, y + 50);
    ctx.fillText('🔥 ' + (recipe.calories || '—'), 30, y + 75);
    ctx.fillText('📊 ' + (recipe.difficulty || '—'), 30, y + 100);

    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    const desc = (recipe.description || '').slice(0, 120);
    const dwords = desc.split(' ');
    let dl = '';
    let dy = y + 140;
    for (const w of dwords) {
      const t = dl + w + ' ';
      if (ctx.measureText(t).width > 260 && dl) {
        ctx.fillText(dl.trim(), 30, dy);
        dl = w + ' ';
        dy += 18;
      } else { dl = t; }
    }
    ctx.fillText(dl.trim(), 30, dy);

    // AutoChef watermark
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('AutoChef AI', 30, 470);

    // Download
    const link = document.createElement('a');
    link.download = `${(recipe.name || 'recipe').replace(/\s+/g, '-').toLowerCase()}-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const qrImageUrl = qrShortUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&ecc=L&data=${encodeURIComponent(qrShortUrl)}`
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
          {isSaved && isAutoTagging && <span className="text-xs text-slate-400 animate-pulse">🏷️</span>}
        </button>

        {/* Shopping List */}
        <button
          onClick={onShoppingList}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-green-500/30 hover:text-green-400 transition-all"
        >
          <ShoppingCart size={16} />
          Shopping List
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

        {/* Download */}
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-white/20 transition-all"
        >
          <Download size={16} />
          .txt
        </button>

        {/* QR Code */}
        <button
          onClick={() => setShowQR(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showQR ? 'bg-slate-800 border-white/20 text-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'}`}
        >
          <QrCode size={16} />
          QR
        </button>

        {/* New Recipe */}
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-orange-500/30 hover:text-orange-400 transition-all"
        >
          <RotateCcw size={16} />
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

        {/* Save as Card */}
        <button
          onClick={handleExportCard}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-purple-500/30 hover:text-purple-400 transition-all"
        >
          <CreditCard size={16} />
          Save Card
        </button>

        {/* More actions toggle */}
        <button
          onClick={() => setShowExtras(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showExtras ? 'bg-slate-800 border-white/20 text-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'}`}
        >
          More <ChevronDown size={14} className={`transition-transform ${showExtras ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Extra actions panel */}
      {showExtras && (
        <div className="flex flex-wrap gap-2 p-4 bg-slate-900/50 rounded-2xl border border-white/5 animate-in fade-in duration-200">
          {/* Similar Recipe */}
          <button
            onClick={onSimilar}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5 text-orange-400 text-sm font-medium hover:bg-orange-500/10 transition-all"
          >
            <Shuffle size={16} />
            Similar Recipe
          </button>

          {/* Make Healthier */}
          <button
            onClick={() => handleVariant('healthier')}
            disabled={!!variantLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/20 bg-green-500/5 text-green-400 text-sm font-medium hover:bg-green-500/10 transition-all disabled:opacity-50"
          >
            {variantLoading === 'healthier' ? <Loader2 size={16} className="animate-spin" /> : <Leaf size={16} />}
            Make Healthier
          </button>

          {/* Make Cheaper */}
          <button
            onClick={() => handleVariant('cheaper')}
            disabled={!!variantLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-sm font-medium hover:bg-yellow-500/10 transition-all disabled:opacity-50"
          >
            {variantLoading === 'cheaper' ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
            Make Cheaper
          </button>

          {/* Make it Easier */}
          <button
            onClick={() => handleVariant('easier')}
            disabled={!!variantLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-sm font-medium hover:bg-indigo-500/10 transition-all disabled:opacity-50"
          >
            {variantLoading === 'easier' ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
            Make it Easier
          </button>

          {/* Make it Harder */}
          <button
            onClick={() => handleVariant('harder')}
            disabled={!!variantLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-rose-400 text-sm font-medium hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {variantLoading === 'harder' ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} />}
            Make it Harder
          </button>

          {/* Translate */}
          <button
            onClick={() => handleVariant('translate:Spanish')}
            disabled={!!variantLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-all disabled:opacity-50"
          >
            {variantLoading.startsWith('translate') ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
            Translate (ES)
          </button>

          {/* Social Caption */}
          <button
            onClick={handleCopyCaption}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm font-medium hover:bg-purple-500/10 transition-all"
          >
            <MessageSquare size={16} />
            {captionCopied ? 'Copied!' : 'Copy Caption'}
          </button>

          {/* Embed Code */}
          <button
            onClick={() => { setShowEmbed(v => !v); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-all"
          >
            <Code size={16} />
            Embed Code
          </button>
        </div>
      )}

      {/* Embed code display */}
      {showEmbed && shareUrl && (
        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-2 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Embed this recipe</p>
          <code className="block text-xs text-slate-400 bg-slate-800 p-3 rounded-xl break-all">
            {`<iframe src="${qrShortUrl || shareUrl}" width="600" height="500" style="border:none;border-radius:16px;" title="${recipe.name}"></iframe>`}
          </code>
          <button
            onClick={handleCopyEmbed}
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            {embedCopied ? 'Copied!' : 'Copy embed code'}
          </button>
        </div>
      )}

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-2xl w-full sm:w-fit">
          <div className="flex items-center gap-4">
            {qrImageUrl
              ? <img src={qrImageUrl} alt="QR Code" className="w-32 h-32 shrink-0" />
              : <div className="w-32 h-32 bg-slate-100 rounded-xl animate-pulse shrink-0" />
            }
            <div>
              <p className="text-slate-900 text-sm font-medium">Scan to open this recipe</p>
              {qrShortUrl && <p className="text-slate-500 text-xs mt-1 break-all">{qrShortUrl}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
