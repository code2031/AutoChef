const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

async function groqFetch(body) {
  if (!GROQ_API_KEY) throw new Error('API Key missing. Ensure GitHub Actions secrets are mapped correctly.');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  return response.json();
}

export async function scanImageForIngredients(base64Data) {
  const data = await groqFetch({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image of a fridge or pantry. List every edible ingredient you can see clearly. Return ONLY a valid JSON array of strings, like this: ["milk", "eggs", "carrots"]. Do not include markdown formatting or any other text.' },
          { type: 'image_url', image_url: { url: base64Data } },
        ],
      },
    ],
    temperature: 0.1,
  });
  const text = data.choices[0].message.content;
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateRecipe(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateSuggestions(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.suggestions || [];
}

export async function generateVariant(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}
