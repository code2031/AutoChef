// Round 10: build a self-contained, printable HTML "cookbook" from saved
// recipe-history entries. Returns an HTML string with inline styles so it
// works fully offline. Used by the Cookbook export button in RecipeHistory.
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function recipeSection(entry, index) {
  const r = entry.recipe || entry;
  const ings = (r.ingredients || []).map(i => `<li>${esc(i)}</li>`).join('');
  const steps = (r.instructions || []).map(i => `<li>${esc(i)}</li>`).join('');
  const meta = [
    r.time || r.cookTime ? `⏱ ${esc(r.time || r.cookTime)}` : '',
    r.difficulty ? `📊 ${esc(r.difficulty)}` : '',
    r.calories ? `🔥 ${esc(r.calories)} cal` : '',
    r.servings ? `🍽 ${esc(r.servings)} servings` : '',
  ].filter(Boolean).map(m => `<span>${m}</span>`).join('');
  const tags = (entry.tags || []).map(t => `<em>#${esc(t)}</em>`).join(' ');
  return `
    <article id="recipe-${index}">
      <h2>${index + 1}. ${esc(r.name || 'Recipe')}</h2>
      ${r.description ? `<p class="desc">${esc(r.description)}</p>` : ''}
      <div class="meta">${meta}</div>
      ${tags ? `<p class="tags">${tags}</p>` : ''}
      <h3>Ingredients</h3>
      <ul>${ings}</ul>
      <h3>Instructions</h3>
      <ol>${steps}</ol>
      ${r.chefTip ? `<div class="tip"><strong>Chef's Tip:</strong> ${esc(r.chefTip)}</div>` : ''}
    </article>`;
}

export function buildCookbookHtml(entries, title = 'My AutoChef Cookbook') {
  const list = entries || [];
  const toc = list
    .map((e, i) => `<li><a href="#recipe-${i}">${i + 1}. ${esc((e.recipe || e).name || 'Recipe')}</a></li>`)
    .join('');
  const body = list.map((e, i) => recipeSection(e, i)).join('\n');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;max-width:760px;margin:0 auto;padding:40px 24px;background:#fafaf8;color:#1a1a1a;line-height:1.6}
  h1{color:#c2410c;font-size:2.4rem;text-align:center;border-bottom:4px solid #f97316;padding-bottom:16px;margin-bottom:4px}
  .subtitle{text-align:center;color:#777;margin-top:0;margin-bottom:40px;font-style:italic}
  .toc{background:#fff7ed;border:1px solid #fdba74;border-radius:10px;padding:20px 28px;margin-bottom:48px}
  .toc h3{margin-top:0;color:#9a3412}
  .toc ol{margin:0;padding-left:20px}
  .toc a{color:#c2410c;text-decoration:none}
  .toc a:hover{text-decoration:underline}
  article{margin-bottom:56px;page-break-inside:avoid}
  h2{color:#9a3412;font-size:1.6rem;border-bottom:2px solid #fed7aa;padding-bottom:8px}
  h3{color:#c2410c;margin-bottom:6px}
  .desc{font-style:italic;color:#555}
  .meta{display:flex;gap:16px;flex-wrap:wrap;background:#fff7ed;padding:12px 16px;border-radius:8px;border-left:4px solid #f97316;margin:14px 0;font-size:.9rem}
  .tags{color:#9a3412;font-size:.85rem}
  li{margin:6px 0}
  .tip{background:#fffbeb;border:1px solid #fcd34d;padding:14px;border-radius:8px;margin-top:16px}
  footer{text-align:center;color:#999;font-size:.8rem;margin-top:60px;border-top:1px solid #ddd;padding-top:20px}
  @media print{body{background:white}.toc{break-after:page}}
</style></head><body>
<h1>${esc(title)}</h1>
<p class="subtitle">${list.length} recipe${list.length === 1 ? '' : 's'} · collected with AutoChef AI</p>
<nav class="toc"><h3>Contents</h3><ol>${toc}</ol></nav>
${body}
<footer>Generated with AutoChef AI — your personal kitchen companion.</footer>
</body></html>`;
}
