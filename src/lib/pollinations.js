export function buildImageUrl(recipeName, recipeDesc, imageStyle = 'plated') {
  const styleDesc = {
    plated: 'elegantly plated on a fine dining table, cinematic lighting, shallow depth of field, photorealistic, appetizing.',
    overhead: 'overhead flat-lay shot on a marble surface, minimalist food styling, bright natural light, photorealistic.',
    rustic: 'rustic wooden table, warm natural sunlight, homestyle cooking, cozy atmosphere, photorealistic.',
    'close-up': 'extreme close-up macro food photography, blurred background, intense detail, photorealistic.',
  };
  const imagePrompt = `A high-quality, professional food photography shot of ${recipeName}. ${recipeDesc}. ${styleDesc[imageStyle] || styleDesc.plated}`;
  const encodedPrompt = encodeURIComponent(imagePrompt);
  const seed = Math.floor(Math.random() * 100000);
  return `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&seed=${seed}&width=1024&height=768&negative_prompt=blurry%2C+low+quality`;
}
