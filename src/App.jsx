import React, { useState, useRef } from 'react';
import { 
  ChefHat, Flame, Utensils, Clock, Zap, RotateCcw, 
  Sparkles, Leaf, Timer, BookOpen, ArrowRight, 
  Plus, X, Camera, Loader2, Image as ImageIcon
} from 'lucide-react';

// Safely access environment variables injected during the GitHub Actions build step.
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const POLLINATIONS_API_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY || '';

export default function App() {
  const [view, setView] = useState('landing'); // landing, generate, result
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [diet, setDiet] = useState('none');
  const [vibe, setVibe] = useState('quick');
  
  const [recipe, setRecipe] = useState(null);
  const [recipeImage, setRecipeImage] = useState(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const addIngredient = (name) => {
    const cleanName = name.trim();
    if (cleanName && !ingredients.includes(cleanName)) {
      setIngredients(prev => [...prev, cleanName]);
      setInputValue('');
    }
  };

  const removeIngredient = (tag) => {
    setIngredients(ingredients.filter(i => i !== tag));
  };

  // FEATURE 1: Image Analysis (Vision) via Groq (Llama 3.2 Vision)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!GROQ_API_KEY) {
      setError("API Key missing. Ensure GitHub Actions secrets are mapped correctly.");
      return;
    }

    setIsScanning(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.2-11b-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Analyze this image of a fridge or pantry. List every edible ingredient you can see clearly. Return ONLY a valid JSON array of strings, like this: [\"milk\", \"eggs\", \"carrots\"]. Do not include markdown formatting or any other text." },
                  { type: "image_url", image_url: { url: base64Data } }
                ]
              }
            ],
            temperature: 0.1
          })
        });

        if (!response.ok) throw new Error("Vision API failed");
        
        const data = await response.json();
        const textResponse = data.choices[0].message.content;
        
        // Clean up potential markdown formatting from Groq
        const cleanedText = textResponse.replace(/```json|```/g, '').trim();
        const detectedIngredients = JSON.parse(cleanedText);
        
        if (Array.isArray(detectedIngredients)) {
          const uniqueNew = detectedIngredients.filter(item => !ingredients.includes(item));
          setIngredients(prev => [...prev, ...uniqueNew]);
        }
      } catch (err) {
        console.error(err);
        setError("I couldn't read that photo properly. Ensure your Groq key is valid or try typing ingredients.");
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate textual recipe via Groq, then trigger image generation via Pollinations
  const generateRecipeAndImage = async () => {
    if (ingredients.length === 0) {
      setError("Please add or scan some ingredients first.");
      return;
    }
    
    if (!GROQ_API_KEY) {
      setError("API Key missing. Ensure GitHub Actions secrets are mapped correctly.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setView('result');

    const promptText = `
    You are AutoChef, a world-class AI culinary assistant.
    Generate a recipe using ONLY or mostly these ingredients: ${ingredients.join(', ')}. 
    Dietary preference: ${diet}. 
    Cooking vibe: ${vibe}. 
    
    You MUST provide your response ONLY as a raw JSON object with the exact following structure. Do not include markdown formatting or extra text:
    {
      "name": "Recipe Name",
      "time": "Prep + Cook Time",
      "difficulty": "Easy/Medium/Hard",
      "calories": "Estimated per serving",
      "description": "Short mouth-watering description",
      "ingredients": ["item 1", "item 2"],
      "instructions": ["step 1", "step 2"],
      "chefTip": "A pro tip to elevate the dish",
      "smartSub": "One smart ingredient substitution"
    }`;

    try {
      // 1. Generate the Text Recipe via Groq (Llama 3.3 70B)
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: promptText }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error("Groq text generation failed");
      
      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      
      setRecipe(content);
      setIsGenerating(false);

      // 2. Generate the Image via Pollinations.ai
      generateRecipeImage(content.name, content.description);

    } catch (err) {
      console.error(err);
      setError("The chef's kitchen is a bit backed up. Please check your Groq API key and try again.");
      setIsGenerating(false);
    }
  };

  // FEATURE 2: Generate images with Pollinations.ai
  const generateRecipeImage = (recipeName, recipeDesc) => {
    setIsGeneratingImage(true);

    // Create the prompt and encode it for the URL
    const imagePrompt = `A high-quality, professional food photography shot of ${recipeName}. ${recipeDesc}. Plated beautifully on a high-end restaurant table, cinematic lighting, shallow depth of field, photorealistic, appetizing.`;
    const encodedPrompt = encodeURIComponent(imagePrompt);

    const seed = Math.floor(Math.random() * 100000);
    const keyParam = POLLINATIONS_API_KEY ? `&key=${POLLINATIONS_API_KEY}` : '';
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&nologo=true${keyParam}`;
    
    const img = new Image();
    img.onload = () => {
      setRecipeImage(imageUrl);
      setIsGeneratingImage(false);
    };
    img.onerror = () => {
      setIsGeneratingImage(false);
    };
    img.src = imageUrl;
  };

  const reset = () => {
    setIngredients([]);
    setRecipe(null);
    setRecipeImage(null);
    setView('generate');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-gradient-to-br from-orange-400 to-red-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <ChefHat size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AutoChef <span className="text-xs text-orange-500 font-mono tracking-normal">Legacy</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('generate')}
            className="text-sm font-medium px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-lg shadow-orange-500/20"
          >
            My Kitchen
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        
        {/* VIEW: LANDING */}
        {view === 'landing' && (
          <div className="flex flex-col items-center text-center py-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Intelligent Cooking,<br />
              <span className="text-orange-500">Effortless Living.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Snap a photo of your fridge. Our AI identifies ingredients and invents a recipe, and it will also show you exactly what it will look like.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setView('generate')}
                className="group relative px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center gap-2 shadow-2xl shadow-orange-500/20"
              >
                Start Cooking
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW: GENERATE */}
        {view === 'generate' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">What's in your pantry?</h2>
                <p className="text-slate-400">Type ingredients or let Groq Vision scan your fridge.</p>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  {isScanning ? 'Scanning...' : 'Scan Fridge'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 p-2 rounded-2xl bg-slate-900 border border-white/5 focus-within:border-orange-500/50 transition-all shadow-inner">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient(inputValue)}
                  placeholder="e.g. Chicken, Spinach, Garlic..."
                  className="bg-transparent border-none outline-none flex-grow px-4 py-2 text-lg"
                />
                <button 
                  onClick={() => addIngredient(inputValue)}
                  className="p-3 bg-white text-slate-950 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {ingredients.map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-full text-sm font-medium group hover:border-orange-500/30 transition-all">
                    {tag}
                    <X size={14} className="text-slate-500 cursor-pointer hover:text-red-400" onClick={() => removeIngredient(tag)} />
                  </span>
                ))}
                {ingredients.length === 0 && !isScanning && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm italic py-2">
                    <ImageIcon size={16} />
                    Add ingredients or upload a photo to start.
                  </div>
                )}
                {isScanning && (
                  <div className="flex items-center gap-2 text-blue-400 text-sm animate-pulse py-2">
                    <Loader2 size={16} className="animate-spin" />
                    Groq Vision is analyzing your photo...
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dietary Needs</label>
                <div className="flex flex-wrap gap-2">
                  {['none', 'vegetarian', 'vegan', 'keto', 'gluten-free'].map(d => (
                    <button 
                      key={d}
                      onClick={() => setDiet(d)}
                      className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl border text-sm capitalize transition-all ${diet === d ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cooking Vibe</label>
                <div className="grid grid-cols-2 gap-2">
                  {['quick', 'fancy', 'healthy', 'comfort'].map(v => (
                    <button 
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${vibe === v ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button 
              onClick={generateRecipeAndImage}
              disabled={ingredients.length === 0 || isGenerating}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${ingredients.length > 0 && !isGenerating ? 'bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              <Zap size={20} fill="currentColor" />
              {isGenerating ? 'Groq is writing recipe...' : 'Generate Gourmet Recipe'}
            </button>
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === 'result' && (
          <div className="animate-in fade-in duration-700 space-y-8">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="text-orange-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Groq is thinking...</h3>
                  <p className="text-slate-400">Creating a masterpiece from your ingredients.</p>
                </div>
              </div>
            ) : recipe && (
              <div className="space-y-8">
                
                {/* Generated Recipe Image Hero */}
                <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden relative bg-slate-900 border border-white/10 group">
                  {recipeImage ? (
                    <img 
                      src={recipeImage} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
                    />
                  ) : isGeneratingImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 space-y-4">
                      <div className="text-orange-500 animate-bounce">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-slate-400 font-medium tracking-wide flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Pollinations is rendering your dish...
                      </p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                      <ImageIcon size={48} className="text-slate-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                  
                  {/* Floating text over image */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <button onClick={reset} className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm mb-2 drop-shadow-md">
                      <RotateCcw size={14} /> Start Over
                    </button>
                    <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">{recipe.name}</h2>
                  </div>
                </div>

                {/* Description & Stats */}
                <div className="space-y-6">
                  <p className="text-slate-300 italic text-lg leading-relaxed">{recipe.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center">
                      <Clock className="mx-auto mb-2 text-orange-500" size={20} />
                      <span className="block text-xs uppercase text-slate-500 font-bold tracking-widest">Time</span>
                      <span className="text-sm font-medium">{recipe.time}</span>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center">
                      <Utensils className="mx-auto mb-2 text-orange-500" size={20} />
                      <span className="block text-xs uppercase text-slate-500 font-bold tracking-widest">Difficulty</span>
                      <span className="text-sm font-medium">{recipe.difficulty}</span>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center">
                      <Flame className="mx-auto mb-2 text-orange-500" size={20} />
                      <span className="block text-xs uppercase text-slate-500 font-bold tracking-widest">Calories</span>
                      <span className="text-sm font-medium">{recipe.calories}</span>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center">
                      <Leaf className="mx-auto mb-2 text-orange-500" size={20} />
                      <span className="block text-xs uppercase text-slate-500 font-bold tracking-widest">Type</span>
                      <span className="text-sm font-medium capitalize">{diet === 'none' ? 'Standard' : diet}</span>
                    </div>
                  </div>
                </div>

                {/* Recipe Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="flex items-center gap-2 font-bold text-lg border-b border-white/5 pb-2">
                        <BookOpen size={18} className="text-orange-500" />
                        Ingredients
                      </h4>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Smart Substitution</h4>
                      <p className="text-sm text-slate-300">{recipe.smartSub}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 shadow-sm">
                      <h4 className="flex items-center gap-2 font-bold text-lg border-b border-white/5 pb-2">
                        <Timer size={18} className="text-orange-500" />
                        Instructions
                      </h4>
                      <div className="space-y-6">
                        {recipe.instructions.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-500 text-sm border border-white/5 shadow-inner">
                              {i + 1}
                            </span>
                            <p className="text-slate-300 leading-relaxed pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
                      <Sparkles className="text-blue-400 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-blue-400">Chef's Pro Tip</h4>
                        <p className="text-sm text-slate-300 italic">{recipe.chefTip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
