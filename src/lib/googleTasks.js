/**
 * Google Tasks API integration via OAuth 2.0 (Google Identity Services).
 * Requires VITE_GOOGLE_CLIENT_ID env var or user-configured client ID.
 */

function loadGIS() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export async function getGoogleAccessToken(clientId) {
  await loadGIS();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/tasks',
      callback: (response) => {
        if (response.error) reject(new Error(response.error_description || response.error));
        else resolve(response.access_token);
      },
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}

export async function addToGoogleTasks(items, accessToken) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Find or create "AutoChef Shopping" task list
  const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', { headers });
  if (!listsRes.ok) throw new Error('Failed to fetch Google Tasks lists');
  const listsData = await listsRes.json();
  let listId = listsData.items?.find(l => l.title === 'AutoChef Shopping')?.id;

  if (!listId) {
    const createRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: 'AutoChef Shopping' }),
    });
    if (!createRes.ok) throw new Error('Failed to create Google Tasks list');
    const created = await createRes.json();
    listId = created.id;
  }

  let success = 0;
  let failed = 0;
  for (const item of items) {
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: item }),
      });
      if (res.ok) success++;
      else failed++;
    } catch {
      failed++;
    }
  }
  return { success, failed };
}
