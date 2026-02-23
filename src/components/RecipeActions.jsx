import React, { useState, useEffect } from 'react';
import { Heart, Share2, Printer, QrCode, RotateCcw, ThumbsUp, ThumbsDown, Image as ImageIcon, Loader2, Download, Code, MessageSquare, Languages, Leaf, DollarSign, ChevronDown, ShoppingCart, Shuffle, BookOpen, Flame, CreditCard, Copy, Check, X, Users, ChefHat, Globe } from 'lucide-react';
import { generateVariant, generateSecretIngredient, generateChefLetter, generateRecipeHaiku, generateBatchPrep } from '../lib/groq.js';
import { buildVariantPrompt } from '../lib/prompts.js';
async function buildLongUrl(recipe, imageUrl) {
  const payload = JSON.stringify({ r: recipe, i: imageUrl || "" });
  const bytes = new TextEncoder().encode(payload);
  const base = window.location.origin + window.location.pathname;
  try {
    const cs = new CompressionStream("deflate-raw");
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    const encoded = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return base+"?rc="+encodeURIComponent(encoded);
  } catch {
    const encoded = btoa(String.fromCharCode(...bytes));
    return base+"?r="+encodeURIComponent(encoded);
  }
}

async function shortenUrl(longUrl) {
  const res = await fetch("https://is.gd/create.php?format=json&url="+encodeURIComponent(longUrl));
  const data = await res.json();
  if (!data.shorturl) throw new Error("no shorturl");
  return data.shorturl;
}

export default function RecipeActions({
  recipe, recipeImage, isSaved, isAutoTagging, rating, totalLikes, totalDislikes,
  onSave, onRegenerate, onRegenerateImage, onRate, onDownload, isRegeneratingImage,
  onVariantReady, onSimilar, onShoppingList, persona, onShowPlating, onShowRegional,
}) {
  const [showQR, setShowQR] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [qrShortUrl, setQrShortUrl] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  const [variantLoading, setVariantLoading] = useState("");
  const [embedCopied, setEmbedCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [secretIng, setSecretIng] = useState({ loading: false, data: null });
  const [chefLetter, setChefLetter] = useState({ loading: false, data: null });
  const [haiku, setHaiku] = useState({ loading: false, data: null, copied: false });
  const [batchResult, setBatchResult] = useState({ loading: false, data: null, servings: 20, inputShown: false });

  useEffect(() => {
    buildLongUrl(recipe, recipeImage).then(async (longUrl) => {
      setShareUrl(longUrl);
      window.history.replaceState(null, "", longUrl);
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
      try { await navigator.share({ title: recipe.name, url: shareUrl }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShareMsg("Copied!");
      setTimeout(() => setShareMsg(""), 2000);
    }
  };

  const handlePrint = () => window.print();

  const handleCopyCaption = async () => {
    const url = qrShortUrl || shareUrl;
    const caption = "Just made "+recipe.name+" with AutoChef AI! \n"+url;
    await navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleCopyEmbed = async () => {
    if (!shareUrl) return;
    const tag = ["<iframe src=",shareUrl," width=600 height=500></iframe>"].join("");
    await navigator.clipboard.writeText(tag);
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
    } catch { /* variant failed */ }
    finally { setVariantLoading(""); }
  };

  const handleExportCard = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, 800, 500);
    ctx.fillStyle = "#f97316";
    ctx.fillRect(0, 0, 8, 500);
    if (recipeImage) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = recipeImage; });
        ctx.drawImage(img, 300, 0, 500, 500);
        const grad = ctx.createLinearGradient(300, 0, 800, 0);
        grad.addColorStop(0, "rgba(2,6,23,1)");
        grad.addColorStop(0.3, "rgba(2,6,23,0.6)");
        grad.addColorStop(1, "rgba(2,6,23,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(300, 0, 500, 500);
      } catch { /* image load failed */ }
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText((recipe.name||"Recipe").slice(0,28), 30, 80);
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Time: "+(recipe.time||"—"), 30, 130);
    ctx.fillText("Calories: "+(recipe.calories||"—"), 30, 155);
    ctx.fillText("Difficulty: "+(recipe.difficulty||"—"), 30, 180);
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("AutoChef AI", 30, 470);
    const link = document.createElement("a");
    link.download = (recipe.name||"recipe").replace(/\s+/g,"-").toLowerCase()+"-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleSecretIngredient = async () => {
    if (secretIng.loading) return;
    setSecretIng({ loading: true, data: null });
    try {
      const result = await generateSecretIngredient(recipe);
      setSecretIng({ loading: false, data: result });
    } catch { setSecretIng({ loading: false, data: null }); }
  };

  const handleChefLetter = async () => {
    if (chefLetter.loading) return;
    setChefLetter({ loading: true, data: null });
    try {
      const result = await generateChefLetter(recipe, persona);
      setChefLetter({ loading: false, data: result });
    } catch { setChefLetter({ loading: false, data: null }); }
  };

  const handleHaiku = async () => {
    if (haiku.loading) return;
    setHaiku(prev => ({ ...prev, loading: true, data: null }));
    try {
      const result = await generateRecipeHaiku(recipe);
      setHaiku({ loading: false, data: result, copied: false });
    } catch { setHaiku({ loading: false, data: null, copied: false }); }
  };

  const handleBatchPrep = async () => {
    if (batchResult.loading) return;
    setBatchResult(prev => ({ ...prev, loading: true, data: null }));
    try {
      const result = await generateBatchPrep(recipe, batchResult.servings);
      setBatchResult(prev => ({ ...prev, loading: false, data: result }));
    } catch { setBatchResult(prev => ({ ...prev, loading: false, data: null })); }
  };

  const copyHaiku = async () => {
    if (!haiku.data) return;
    await navigator.clipboard.writeText(haiku.data);
    setHaiku(prev => ({ ...prev, copied: true }));
    setTimeout(() => setHaiku(prev => ({ ...prev, copied: false })), 2000);
  };

  const qrImageUrl = qrShortUrl
    ? "https://api.qrserver.com/v1/create-qr-code/?size=200x200&ecc=L&data="+encodeURIComponent(qrShortUrl)
    : "";

  return (
    <div className="space-y-3 no-print">
      <div className="flex flex-wrap gap-2">
        <button onClick={onSave} className={(isSaved?"bg-pink-500/10 border-pink-500/40 text-pink-400":"bg-slate-900 border-white/5 text-slate-400 hover:border-white/20")+" flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"}>
          <Heart size={16} fill={isSaved?"currentColor":"none"} />
          {isSaved?"Saved":"Save"}
          {isSaved && isAutoTagging && <span className="text-xs text-slate-400 animate-pulse">🏷️</span>}
        </button>
        <button onClick={onShoppingList} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-green-500/30 hover:text-green-400 transition-all"><ShoppingCart size={16} />Shopping List</button>
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-white/20 transition-all"><Share2 size={16} />{shareMsg||"Share"}</button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-white/20 transition-all"><Printer size={16} />Print</button>
        <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-white/20 transition-all"><Download size={16} />.txt</button>
        <button onClick={()=>setShowQR(v=>!v)} className={(showQR?"bg-slate-800 border-white/20 text-white":"bg-slate-900 border-white/5 text-slate-400 hover:border-white/20")+" flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"}><QrCode size={16} />QR</button>
        <button onClick={onRegenerate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-orange-500/30 hover:text-orange-400 transition-all"><RotateCcw size={16} />New Recipe</button>
        <button onClick={onRegenerateImage} disabled={isRegeneratingImage} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-blue-500/30 hover:text-blue-400 transition-all disabled:opacity-50">{isRegeneratingImage?<Loader2 size={16} className="animate-spin" />:<ImageIcon size={16} />}New Image</button>
        <button onClick={handleExportCard} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-400 text-sm font-medium hover:border-purple-500/30 hover:text-purple-400 transition-all"><CreditCard size={16} />Save Card</button>
        <button onClick={()=>setShowExtras(v=>!v)} className={(showExtras?"bg-slate-800 border-white/20 text-white":"bg-slate-900 border-white/5 text-slate-400 hover:border-white/20")+" flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"}>More <ChevronDown size={14} className={(showExtras?"rotate-180":"")+" transition-transform"} /></button>
      </div>

      {showExtras && (
        <div className="flex flex-wrap gap-2 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
          <button onClick={onSimilar} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5 text-orange-400 text-sm font-medium hover:bg-orange-500/10 transition-all"><Shuffle size={16} />Similar Recipe</button>
          <button onClick={()=>handleVariant("healthier")} disabled={!!variantLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/20 bg-green-500/5 text-green-400 text-sm font-medium hover:bg-green-500/10 transition-all disabled:opacity-50">{variantLoading==="healthier"?<Loader2 size={16} className="animate-spin" />:<Leaf size={16} />}Make Healthier</button>
          <button onClick={()=>handleVariant("cheaper")} disabled={!!variantLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-sm font-medium hover:bg-yellow-500/10 transition-all disabled:opacity-50">{variantLoading==="cheaper"?<Loader2 size={16} className="animate-spin" />:<DollarSign size={16} />}Make Cheaper</button>
          <button onClick={()=>handleVariant("easier")} disabled={!!variantLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-sm font-medium hover:bg-indigo-500/10 transition-all disabled:opacity-50">{variantLoading==="easier"?<Loader2 size={16} className="animate-spin" />:<BookOpen size={16} />}Make it Easier</button>
          <button onClick={()=>handleVariant("harder")} disabled={!!variantLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-rose-400 text-sm font-medium hover:bg-red-500/10 transition-all disabled:opacity-50">{variantLoading==="harder"?<Loader2 size={16} className="animate-spin" />:<Flame size={16} />}Make it Harder</button>
          <button onClick={()=>handleVariant("translate:Spanish")} disabled={!!variantLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-all disabled:opacity-50">{variantLoading.startsWith("translate")?<Loader2 size={16} className="animate-spin" />:<Languages size={16} />}Translate (ES)</button>
          <button onClick={handleCopyCaption} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-500/20 text-purple-400 text-sm font-medium transition-all"><MessageSquare size={16} />{captionCopied?"Copied!":"Copy Caption"}</button>
          <button onClick={()=>setShowEmbed(v=>!v)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800 text-slate-300 text-sm font-medium transition-all"><Code size={16} />Embed Code</button>
          <button onClick={handleSecretIngredient} disabled={secretIng.loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-500/20 text-purple-400 text-sm font-medium transition-all disabled:opacity-50">{secretIng.loading?<Loader2 size={16} className="animate-spin" />:<span>🎲</span>}Secret Ingredient</button>
          <button onClick={handleChefLetter} disabled={chefLetter.loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-blue-400 text-sm font-medium transition-all disabled:opacity-50">{chefLetter.loading?<Loader2 size={16} className="animate-spin" />:<span>✉</span>}Chef Letter</button>
          <button onClick={handleHaiku} disabled={haiku.loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-pink-400 text-sm font-medium transition-all disabled:opacity-50">{haiku.loading?<Loader2 size={16} className="animate-spin" />:<span>🎋</span>}Recipe Haiku</button>
          <button onClick={()=>{const ns={...batchResult,inputShown:!batchResult.inputShown};setBatchResult(ns);}} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-green-400 text-sm font-medium transition-all"><Users size={16} />Batch Prep</button>
          {onShowPlating && <button onClick={onShowPlating} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-orange-400 text-sm font-medium transition-all"><ChefHat size={16} />Plating Guide</button>}
          {onShowRegional && <button onClick={onShowRegional} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-teal-400 text-sm font-medium transition-all"><Globe size={16} />Regional Variants</button>}
        </div>
      )}

      {showEmbed && shareUrl && (
        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-2">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Embed this recipe</p>
          <code className="block text-xs text-slate-400 bg-slate-800 p-3 rounded-xl break-all">{`<iframe src="${shareUrl}" width=600 height=500></iframe>`}</code>
          <button onClick={handleCopyEmbed} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">{embedCopied?"Copied!":"Copy embed code"}</button>
        </div>
      )}

      {batchResult.inputShown && (
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest">Batch Prep</p>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Target servings:</label>
            <input type="number" value={batchResult.servings} onChange={e=>{const ns={...batchResult,servings:parseInt(e.target.value)||20};setBatchResult(ns);}} className="w-20 bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-center text-slate-300 outline-none" min="2" max="200" />
            <button onClick={handleBatchPrep} disabled={batchResult.loading} className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5">{batchResult.loading?<Loader2 size={14} className="animate-spin" />:null}Scale Up</button>
          </div>
          {batchResult.data && (
            <div className="space-y-2">
              <p className="text-xs text-green-400 font-bold">{batchResult.data.servings} servings:</p>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {(batchResult.data.ingredients || []).map((ing, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-green-500 shrink-0">•</span>{ing}</li>
                ))}
              </ul>
              {batchResult.data.tip && <p className="text-xs text-slate-400 italic border-t border-white/5 pt-2">{batchResult.data.tip}</p>}
            </div>
          )}
        </div>
      )}

      {secretIng.data && (
        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">🎲 Secret Ingredient</p>
            <button onClick={()=>setSecretIng({loading:false,data:null})} className="text-slate-600 hover:text-slate-400"><X size={14} /></button>
          </div>
          <p className="text-white font-bold">{secretIng.data.ingredient}</p>
          <p className="text-sm text-slate-300">{secretIng.data.reason}</p>
          <p className="text-xs text-purple-400 italic">{secretIng.data.howToAdd}</p>
        </div>
      )}

      {chefLetter.data && (
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">✉ A Note from the Chef</p>
            <button onClick={()=>setChefLetter({loading:false,data:null})} className="text-slate-600 hover:text-slate-400"><X size={14} /></button>
          </div>
          <p className="text-sm text-slate-300 italic leading-relaxed">&ldquo;{chefLetter.data}&rdquo;</p>
        </div>
      )}

      {haiku.data && (
        <div className="p-4 bg-pink-500/5 border border-pink-500/20 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">🎋 Recipe Haiku</p>
            <div className="flex gap-2">
              <button onClick={copyHaiku} className="text-slate-500 hover:text-pink-400 transition-colors">{haiku.copied?<Check size={14} className="text-green-400" />:<Copy size={14} />}</button>
              <button onClick={()=>setHaiku({loading:false,data:null,copied:false})} className="text-slate-600 hover:text-slate-400"><X size={14} /></button>
            </div>
          </div>
          <p className="text-slate-200 font-medium leading-relaxed whitespace-pre-line text-center py-2">{haiku.data}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">Rate this recipe:</span>
        <button onClick={()=>onRate("up")} className={(rating==="up"?"bg-green-500/20 text-green-400":"text-slate-500 hover:text-green-400")+" flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"}>
          <ThumbsUp size={15} />
          {totalLikes > 0 && <span className="font-bold">{totalLikes}</span>}
        </button>
        <button onClick={()=>onRate("down")} className={(rating==="down"?"bg-red-500/20 text-red-400":"text-slate-500 hover:text-red-400")+" flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"}>
          <ThumbsDown size={15} />
          {totalDislikes > 0 && <span className="font-bold">{totalDislikes}</span>}
        </button>
      </div>

      {showQR && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-2xl w-full sm:w-fit">
          <div className="flex items-center gap-4">
            {qrImageUrl ? <img src={qrImageUrl} alt="QR Code" className="w-32 h-32 shrink-0" /> : <div className="w-32 h-32 bg-slate-100 rounded-xl animate-pulse shrink-0" />}
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
