const POLLINATIONS_API_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY || '';

export function buildImageUrl(recipeName, recipeDesc) {
  const imagePrompt = `A high-quality, professional food photography shot of ${recipeName}. ${recipeDesc}. Plated beautifully on a high-end restaurant table, cinematic lighting, shallow depth of field, photorealistic, appetizing.`;
  const encodedPrompt = encodeURIComponent(imagePrompt);
  const seed = Math.floor(Math.random() * 100000);
  const keyParam = POLLINATIONS_API_KEY ? `&key=${POLLINATIONS_API_KEY}` : '';
  return `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&seed=${seed}&width=1024&height=768&negative_prompt=blurry%2C+low+quality${keyParam}`;
}
