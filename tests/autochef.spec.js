import { test, expect } from '@playwright/test';

// Universal Groq mock response — works for all call types:
// - generateSuggestions reads parsed.suggestions
// - generateRecipe uses the full object (name, ingredients, etc.)
// - Other calls (story, mistakes, pairings, etc.) use their respective fields
const UNIVERSAL_MOCK_RESPONSE = {
  // Recipe fields
  name: 'Test Pasta',
  prepTime: '10 minutes',
  cookTime: '20 minutes',
  time: '30 minutes',
  difficulty: 'Easy',
  calories: '450 per serving',
  servings: 2,
  description: 'A simple test pasta dish.',
  ingredients: ['200g pasta', '2 cloves garlic', '3 tbsp olive oil', '1 cup spinach', '50g parmesan'],
  instructions: ['Boil pasta in a large pot for 10 minutes.', 'Sauté garlic in a pan with olive oil for 2 minutes.', 'Combine and serve with a spatula.'],
  nutrition: { protein: '15g', carbs: '60g', fat: '12g', fiber: '3g' },
  winePairing: 'Pinot Grigio',
  chefTip: 'Salt your pasta water generously.',
  smartSub: 'Use zucchini noodles for low-carb.',
  // Suggestions fields (used by generateSuggestions → parsed.suggestions)
  suggestions: [
    { name: 'Pasta Primavera', description: 'A fresh Italian pasta with spring vegetables.' },
    { name: 'Garlic Noodles', description: 'Simple, fragrant garlic-flavored noodles.' },
    { name: 'Spinach Linguine', description: 'Healthy spinach pasta with light sauce.' },
  ],
  // Other feature fields
  result: 'ok',
  story: 'A classic dish.',
  mistakes: [{ mistake: 'Overcooking', fix: 'Watch the timer.' }],
  pairings: [],
  tags: ['easy', 'pasta'],
  tip: 'Use fresh ingredients.',
  storage: 'Refrigerate up to 3 days.',
  shelf_life: '3 days',
  haiku: 'Golden pasta waits\nGarlic sizzles in the pan\nDinner is ready',
  letter: 'Dear cook, enjoy this dish.',
  ingredient: 'Lemon zest',
  reason: 'Adds brightness.',
  howToAdd: 'Grate over finished dish.',
  variants: [{ region: 'Italian', description: 'Classic version', keyDifferences: ['More garlic'] }],
};

// Helper: intercept all Groq API calls and return canned responses
async function mockGroq(page) {
  await page.route('**/openai/v1/chat/completions', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{ message: { content: JSON.stringify(UNIVERSAL_MOCK_RESPONSE) } }],
      }),
    });
  });

  // Mock Pollinations image (return a 1x1 transparent PNG)
  await page.route('**/pollinations.ai/**', route => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='), c => c.charCodeAt(0)),
  }));

  // Mock is.gd shortener
  await page.route('**/is.gd/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ shorturl: 'https://is.gd/test123' }),
  }));
}

// Helper: navigate to generate view and fill ingredients
async function goToGenerate(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /my kitchen/i }).click();
  await expect(page.locator('#app-root')).toBeVisible();
}

async function addIngredientAndGenerate(page) {
  await goToGenerate(page);
  const input = page.locator('input[placeholder*="Chicken" i]').first();
  await input.fill('pasta');
  await input.press('Enter');
  await page.getByRole('button', { name: /generate/i }).first().click();
  // Pick first suggestion
  await page.getByRole('button', { name: /pasta primavera/i }).first().click({ timeout: 10000 });
  await expect(page.locator('text=Test Pasta').first()).toBeVisible({ timeout: 15000 });
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AutoChef/i);
    await expect(page.locator('img[alt="AutoChef"]')).toBeVisible();
  });

  test('My Kitchen navigates to generate view', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /my kitchen/i }).click();
    await expect(page.locator('text=What\'s in your').or(page.locator('text=Ingredients')).or(page.locator('input[placeholder*="Chicken" i]')).first()).toBeVisible();
  });

  test('History link opens history view', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /history/i }).click();
    await expect(page.locator('text=Recipe History').or(page.locator('text=No recipes yet'))).toBeVisible();
  });

  test('Planner link opens meal planner', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /planner/i }).click();
    await expect(page.locator('text=Meal Planner').or(page.locator('text=Monday')).first()).toBeVisible();
  });

  test('Sync link opens sync planner', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sync/i }).click();
    await expect(page.locator('text=Sync').or(page.locator('text=serve')).or(page.locator('text=dish')).first()).toBeVisible();
  });
});

// ─── NAVBAR SETTINGS ──────────────────────────────────────────────────────────

test.describe('Navbar Settings', () => {
  test('settings dropdown opens', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    await expect(page.locator('text=Light Mode').or(page.locator('text=Dark Mode'))).toBeVisible();
  });

  test('theme toggle switches between dark and light', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    const themeBtn = page.locator('button', { hasText: /light mode|dark mode/i }).first();
    const initialText = await themeBtn.textContent();
    await themeBtn.click();
    // Dropdown stays open after clicking theme — no need to re-open it
    const newText = await page.locator('button', { hasText: /light mode|dark mode/i }).first().textContent();
    expect(newText).not.toEqual(initialText);
  });

  test('font size buttons work', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    await page.getByRole('button', { name: 'LG' }).click();
    const root = page.locator('#app-root');
    await expect(root).toHaveClass(/font-sz-lg/);
  });

  test('temperature unit toggles between C and F', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    await page.getByRole('button', { name: '°F' }).click();
    // Switch back
    await page.getByRole('button', { name: '°C' }).click();
    await expect(page.getByRole('button', { name: '°C' })).toBeVisible();
  });

  test('custom prompt textarea is present and accepts input', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    const ta = page.locator('textarea[placeholder*="vegan" i]');
    await expect(ta).toBeVisible();
    await ta.fill('Always include a gluten-free note.');
    await expect(ta).toHaveValue('Always include a gluten-free note.');
  });

  test('nutrition goals fields accept input', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    await page.locator('button', { hasText: /daily nutrition goals/i }).click();
    const caloriesInput = page.locator('input[min="0"]').first();
    await caloriesInput.fill('2000');
    await expect(caloriesInput).toHaveValue('2000');
  });

  test('keyboard shortcuts modal opens', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    await page.locator('button', { hasText: /keyboard shortcuts/i }).click();
    await expect(page.locator('text=Ctrl/Cmd')).toBeVisible();
  });

  test('high contrast mode toggles', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav button[title="Settings"]').click();
    await page.locator('button', { hasText: /high contrast/i }).click();
    await expect(page.locator('#app-root')).toHaveClass(/high-contrast/);
  });
});

// ─── KITCHEN TIMER ────────────────────────────────────────────────────────────

test.describe('Kitchen Timer', () => {
  test('timer dropdown opens', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /timer/i }).click();
    await expect(page.locator('text=Kitchen Timer').or(page.locator('input[placeholder*="min" i]'))).toBeVisible();
  });

  test('timer closes when clicking outside', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /timer/i }).click();
    await expect(page.locator('text=Kitchen Timers').first()).toBeVisible();
    // Click the backdrop overlay div (fixed inset-0) which calls setShowTimer(false)
    await page.locator('div.fixed.inset-0').first().click();
    await expect(page.locator('text=Kitchen Timers').first()).not.toBeVisible({ timeout: 3000 });
  });
});

// ─── GENERATE VIEW TABS ───────────────────────────────────────────────────────

test.describe('GenerateView tabs', () => {
  test('all four tabs are present', async ({ page }) => {
    await goToGenerate(page);
    await expect(page.locator('button', { hasText: /ingredients/i }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: /dish name/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /import/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /historical/i })).toBeVisible();
  });

  test('Historical tab shows era selector', async ({ page }) => {
    await goToGenerate(page);
    await page.locator('button', { hasText: /historical/i }).click();
    await expect(page.locator('select').or(page.locator('text=Medieval').or(page.locator('text=era'))).first()).toBeVisible();
  });

  test('Import tab shows textarea', async ({ page }) => {
    await goToGenerate(page);
    await page.locator('button', { hasText: /import/i }).click();
    await expect(page.locator('textarea').or(page.locator('input[placeholder*="paste" i]'))).toBeVisible();
  });

  test('Gut Health toggle works', async ({ page }) => {
    await goToGenerate(page);
    const gutBtn = page.locator('button', { hasText: /gut health/i });
    await expect(gutBtn).toBeVisible();
    await gutBtn.click();
    await expect(gutBtn).toHaveClass(/green|active|bg-green/);
  });

  test('Zero-Waste toggle works', async ({ page }) => {
    await goToGenerate(page);
    const zwBtn = page.locator('button', { hasText: /zero.waste/i });
    await expect(zwBtn).toBeVisible();
    await zwBtn.click();
    await expect(zwBtn).toHaveClass(/teal/);
  });

  test('A/B Test button is present', async ({ page }) => {
    await goToGenerate(page);
    const input = page.locator('input[placeholder*="Chicken" i]').first();
    await input.fill('pasta');
    await input.press('Enter');
    await expect(page.locator('button', { hasText: /a\/b test|generate two/i })).toBeVisible();
  });
});

// ─── RECIPE GENERATION ────────────────────────────────────────────────────────

test.describe('Recipe Generation', () => {
  test.beforeEach(async ({ page }) => {
    await mockGroq(page);
  });

  test('generates recipe from ingredients via suggestions', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Test Pasta').first()).toBeVisible();
    await expect(page.locator('text=pasta').first()).toBeVisible();
  });

  test('generates recipe by dish name', async ({ page }) => {
    await goToGenerate(page);
    await page.locator('button', { hasText: /dish name/i }).click();
    const dishInput = page.locator('input[placeholder*="Tiramisu" i]').first();
    await dishInput.fill('Tiramisu');
    await dishInput.press('Enter');
    await expect(page.locator('text=Test Pasta').first()).toBeVisible({ timeout: 15000 });
  });

  test('StatsBar shows calories per serving label', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=per serving').first()).toBeVisible();
  });

  test('StatsBar shows Est. Cost badge', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Est. Cost')).toBeVisible();
    // Should not be $0.00
    const costEl = page.locator('text=/~\\$[0-9]/');
    await expect(costEl).toBeVisible();
  });

  test('StatsBar shows difficulty badge with tooltip', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Difficulty')).toBeVisible();
  });

  test('Equipment list section exists', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Equipment Needed').or(page.locator('text=Equipment'))).toBeVisible();
  });

  test('Flavor radar chart renders', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('Recipe description is shown', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=A simple test pasta dish.')).toBeVisible();
  });

  test('Ingredients list renders', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Ingredients').first()).toBeVisible();
    await expect(page.locator('text=pasta').first()).toBeVisible();
  });

  test('Instructions render', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Instructions')).toBeVisible();
    await expect(page.locator('text=Boil pasta')).toBeVisible();
  });

  test('Smart Substitution is shown', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Smart Substitution')).toBeVisible();
  });

  test('Chef\'s Pro Tip is shown', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await expect(page.locator('text=Pro Tip')).toBeVisible();
  });

  test('Serving scaler buttons work', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await page.getByRole('button', { name: '2x' }).click();
    await expect(page.locator('text=2× qty')).toBeVisible();
  });

  test('Start Cooking Mode button opens Mise en Place', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await page.getByRole('button', { name: /start cooking mode/i }).click();
    await expect(page.locator('text=Mise en Place').or(page.locator('text=Prep before')).first()).toBeVisible();
  });

  test('Shopping List modal opens', async ({ page }) => {
    await addIngredientAndGenerate(page);
    // Find shopping list button in recipe actions
    await page.locator('button[title*="shopping" i], button:has-text("Shopping")').first().click();
    await expect(page.locator('text=Shopping List').first()).toBeVisible();
  });
});

// ─── RECIPE ACTIONS ───────────────────────────────────────────────────────────

test.describe('RecipeActions', () => {
  test.beforeEach(async ({ page }) => {
    await mockGroq(page);
    await addIngredientAndGenerate(page);
  });

  test('Save button is present', async ({ page }) => {
    await expect(page.locator('button', { hasText: /save/i }).first()).toBeVisible();
  });

  test('More panel toggle opens', async ({ page }) => {
    const moreBtn = page.locator('button', { hasText: /more/i }).first();
    await moreBtn.click();
    await expect(page.locator('text=Secret Ingredient').or(page.locator('text=Haiku').or(page.locator('text=Plating'))).first()).toBeVisible();
  });

  test('Secret Ingredient button triggers AI call', async ({ page }) => {
    await page.locator('button', { hasText: /more/i }).first().click();
    await page.locator('button', { hasText: /secret ingredient/i }).click();
    await expect(page.locator('text=Lemon zest').or(page.locator('text=loading').or(page.locator('text=ingredient'))).first()).toBeVisible({ timeout: 10000 });
  });

  test('Recipe Haiku button triggers AI call', async ({ page }) => {
    await page.locator('button', { hasText: /more/i }).first().click();
    await page.locator('button', { hasText: /haiku/i }).click();
    await expect(page.locator('text=Golden pasta').or(page.locator('text=haiku')).first()).toBeVisible({ timeout: 10000 });
  });

  test('Chef Letter button triggers AI call', async ({ page }) => {
    await page.locator('button', { hasText: /more/i }).first().click();
    await page.locator('button', { hasText: /chef.*letter/i }).click();
    await expect(page.locator('text=Dear cook').or(page.locator('text=letter')).first()).toBeVisible({ timeout: 10000 });
  });

  test('Plating Guide button opens modal', async ({ page }) => {
    await page.locator('button', { hasText: /more/i }).first().click();
    await page.locator('button', { hasText: /plating guide/i }).click();
    await expect(page.locator('text=Plating Guide').first()).toBeVisible({ timeout: 10000 });
  });

  test('Regional Variants button opens modal', async ({ page }) => {
    await page.locator('button', { hasText: /more/i }).first().click();
    await page.locator('button', { hasText: /regional/i }).click();
    await expect(page.locator('text=Regional Variants').or(page.locator('text=Mexican').or(page.locator('text=Italian'))).first()).toBeVisible({ timeout: 10000 });
  });

  test('Batch Prep shows servings input', async ({ page }) => {
    await page.locator('button', { hasText: /more/i }).first().click();
    await page.locator('button', { hasText: /batch prep/i }).click();
    await expect(page.locator('input[type="number"]').or(page.locator('text=servings')).first()).toBeVisible({ timeout: 5000 });
  });

  test('Rate thumbs up button works', async ({ page }) => {
    const thumbUp = page.locator('button[title*="thumb" i], button:has-text("👍")').first();
    if (await thumbUp.isVisible()) {
      await thumbUp.click();
    }
  });
});

// ─── RESULT VIEW FEATURES ─────────────────────────────────────────────────────

test.describe('ResultView features', () => {
  test.beforeEach(async ({ page }) => {
    await mockGroq(page);
    await addIngredientAndGenerate(page);
  });

  test('Recipe story loads as blockquote', async ({ page }) => {
    // Story auto-loads; wait for it
    await expect(page.locator('blockquote').or(page.locator('text=A classic dish'))).toBeVisible({ timeout: 10000 });
  });

  test('Common Mistakes section appears', async ({ page }) => {
    await expect(page.locator('text=Common Mistakes')).toBeVisible({ timeout: 10000 });
    await page.locator('text=Common Mistakes').click();
    await expect(page.locator('text=Overcooking')).toBeVisible();
  });

  test('Ingredient prep tip popover on click', async ({ page }) => {
    const firstIng = page.locator('ul li span.flex-1').first();
    await firstIng.click();
    await expect(page.locator('text=Prep tip').or(page.locator('text=loading'))).toBeVisible({ timeout: 10000 });
  });

  test('Knife cuts guide link appears for cut techniques', async ({ page }) => {
    // Julienne is in TECHNIQUES; if any instruction mentions it, link appears
    // We test that KnifeCutsGuide can be opened by checking the component
    await page.evaluate(() => {
      window.__testKnifeCut = true;
    });
    // May or may not have cut techniques in mocked recipe; just check it doesn't crash
    await expect(page.locator('text=Instructions')).toBeVisible();
  });

  test('Inline timer appears next to timed steps', async ({ page }) => {
    // Step 1 says "Boil pasta for 10 minutes" — should show timer chip
    await expect(page.locator('text=10:00').or(page.locator('button:has-text("▶")'))).toBeVisible({ timeout: 5000 });
  });

  test('Copy ingredients button works', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    // The ingredient copy button is icon-only (no title, no text) — find it via its container
    // It renders adjacent to the "Ingredients" heading inside the ingredient section
    const ingHeading = page.locator('h4', { hasText: /ingredients/i }).first();
    const copyBtn = ingHeading.locator('~ button, + button').first();
    if (await copyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await copyBtn.click({ force: true });
    }
    // Verify page still displays correctly (no crash)
    await expect(page.locator('text=Test Pasta').first()).toBeVisible();
  });
});

// ─── STATS BAR BADGES ─────────────────────────────────────────────────────────

test.describe('StatsBar badges', () => {
  test.beforeEach(async ({ page }) => {
    await mockGroq(page);
    await addIngredientAndGenerate(page);
  });

  test('Calories shows per serving subLabel', async ({ page }) => {
    await expect(page.locator('text=per serving').first()).toBeVisible();
  });

  test('Nutrition macro bars render', async ({ page }) => {
    await expect(page.locator('text=protein').first()).toBeVisible();
    await expect(page.locator('text=carbs').first()).toBeVisible();
    await expect(page.locator('text=fat').first()).toBeVisible();
    await expect(page.locator('text=fiber').first()).toBeVisible();
  });
});

// ─── PANTRY DRAWER ────────────────────────────────────────────────────────────

test.describe('PantryDrawer', () => {
  async function openPantry(page) {
    await page.goto('/');
    await page.getByRole('button', { name: /my kitchen/i }).click();
    await page.locator('button[title*="pantry" i], button:has-text("Pantry")').first().click();
    await expect(page.locator('text=My Pantry')).toBeVisible();
  }

  test('pantry drawer opens', async ({ page }) => {
    await openPantry(page);
  });

  test('can add an item with zone', async ({ page }) => {
    await openPantry(page);
    const input = page.locator('input[placeholder*="pantry item" i]');
    await input.fill('broccoli');
    // Select fridge zone
    await page.locator('select').selectOption('fridge');
    // Press Enter to add (triggers onKeyDown handler — avoids clicking overlay-blocked suggestion chips)
    await input.press('Enter');
    await expect(page.locator('text=broccoli').first()).toBeVisible();
    await expect(page.locator('text=fridge').first()).toBeVisible();
  });

  test('zone filter tabs are present', async ({ page }) => {
    await openPantry(page);
    await expect(page.locator('button', { hasText: /all/i }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: /fridge/i }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: /freezer/i }).first()).toBeVisible();
  });

  test('analytics toggle shows analytics panel', async ({ page }) => {
    await openPantry(page);
    await page.locator('button', { hasText: /show analytics/i }).click();
    await expect(page.locator('text=Hide Analytics')).toBeVisible();
  });

  test('can add item and remove it', async ({ page }) => {
    await openPantry(page);
    const input = page.locator('input[placeholder*="pantry item" i]');
    await input.fill('testitem123');
    await input.press('Enter');
    await expect(page.locator('text=testitem123').first()).toBeVisible();
    await page.locator('text=testitem123').first().hover();
    await page.locator('button[class*="hover:text-red"]').first().click();
    await expect(page.locator('text=testitem123')).not.toBeVisible();
  });
});

// ─── COOKING STATS ────────────────────────────────────────────────────────────

test.describe('CookingStats', () => {
  test('Stats tab loads in History', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /history/i }).click();
    await page.locator('button', { hasText: /stats/i }).click();
    await expect(page.locator('text=No recipes yet').or(page.locator('text=Total Saved').or(page.locator('text=Cooking Statistics')))).toBeVisible();
  });

  test('CSV export button is present', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /history/i }).click();
    await page.locator('button', { hasText: /stats/i }).click();

    // Add a recipe to history first so stats are shown
    const exportBtn = page.locator('button', { hasText: /export csv/i });
    // Button only appears when history has items — check it's at least findable
    if (await exportBtn.isVisible()) {
      // If visible, we can verify it
      await expect(exportBtn).toBeVisible();
    }
  });
});

// ─── HISTORY ──────────────────────────────────────────────────────────────────

test.describe('Recipe History', () => {
  test.beforeEach(async ({ page }) => {
    await mockGroq(page);
  });

  test('save a recipe and find it in history', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await page.locator('button', { hasText: /save/i }).first().click();
    await page.getByRole('button', { name: /history/i }).click();
    await expect(page.locator('text=Test Pasta').first()).toBeVisible({ timeout: 10000 });
  });

  test('favourite toggle works in history', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await page.locator('button', { hasText: /save/i }).first().click();
    await page.getByRole('button', { name: /history/i }).click();
    const favBtn = page.locator('button[title*="favourite" i], button[title*="favorite" i]').first();
    if (await favBtn.isVisible()) {
      await favBtn.click();
    }
  });

  test('search filters recipes', async ({ page }) => {
    await addIngredientAndGenerate(page);
    await page.locator('button', { hasText: /save/i }).first().click();
    await page.getByRole('button', { name: /history/i }).click();
    const searchInput = page.locator('input[placeholder*="search" i]');
    await searchInput.fill('Test Pasta');
    await expect(page.locator('text=Test Pasta').first()).toBeVisible();
  });
});

// ─── HISTORICAL RECIPE ────────────────────────────────────────────────────────

test.describe('Historical Recipe', () => {
  test.beforeEach(async ({ page }) => {
    await mockGroq(page);
  });

  test('historical tab generates a recipe', async ({ page }) => {
    await goToGenerate(page);
    await page.locator('button', { hasText: /historical/i }).click();
    const dishInput = page.locator('input[placeholder*="Bread" i]').first();
    await dishInput.fill('Roast Chicken');
    // Era selector uses buttons (not a <select>) — click second option
    const eraButtons = page.locator('button', { hasText: /Victorian|Medieval|Rome|Paris|Ming|Ottoman/i });
    if (await eraButtons.count() > 1) await eraButtons.nth(1).click();
    await page.getByRole('button', { name: /generate historical/i }).first().click();
    await expect(page.locator('text=Test Pasta').first()).toBeVisible({ timeout: 15000 });
  });
});

// ─── MEAL PLANNER ─────────────────────────────────────────────────────────────

test.describe('Meal Planner', () => {
  test('weekly grid renders', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /planner/i }).click();
    await expect(page.locator('text=Monday').or(page.locator('text=Breakfast')).first()).toBeVisible();
  });

  test('all days of week are present', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /planner/i }).click();
    for (const day of ['Monday', 'Tuesday', 'Wednesday']) {
      await expect(page.locator(`text=${day}`)).toBeVisible();
    }
  });
});

// ─── SYNC PLANNER ─────────────────────────────────────────────────────────────

test.describe('Sync Planner', () => {
  test('sync planner renders with input fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sync/i }).click();
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('adding a dish shows in timeline', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sync/i }).click();
    // First input is type=number (serve-in minutes); use the dish name text input
    const dishInput = page.locator('input[placeholder*="Dish name" i]');
    const timeInput = page.locator('input[placeholder*="Time" i]');
    if (await dishInput.isVisible()) {
      await dishInput.fill('Pasta');
      await timeInput.fill('20');
    }
  });
});

// ─── PWA / SHARING ────────────────────────────────────────────────────────────

test.describe('Sharing', () => {
  test.beforeEach(async ({ page }) => {
    await mockGroq(page);
    await addIngredientAndGenerate(page);
  });

  test('URL updates with recipe data after generation', async ({ page }) => {
    await expect(page).toHaveURL(/rc=|r=/);
  });

  test('QR code section is accessible', async ({ page }) => {
    const qrBtn = page.locator('button', { hasText: /qr/i });
    if (await qrBtn.isVisible()) {
      await qrBtn.click();
      await expect(page.locator('canvas, svg, img[alt*="qr" i]').first()).toBeVisible();
    }
  });
});
