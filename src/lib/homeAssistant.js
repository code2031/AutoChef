/**
 * Home Assistant REST API shopping list integration.
 * User configures haUrl (e.g. http://homeassistant.local:8123) + haToken.
 *
 * CORS setup required in configuration.yaml:
 *   http:
 *     cors_allowed_origins:
 *       - https://code2031.github.io
 *       - http://localhost:5173
 */
export async function addToHAShoppingList(items, haUrl, haToken) {
  let success = 0;
  let failed = 0;
  let corsBlocked = false;
  const url = haUrl.replace(/\/$/, '');

  for (const item of items) {
    try {
      const res = await fetch(`${url}/api/shopping_list/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${haToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: item }),
      });
      if (res.ok) success++;
      else failed++;
    } catch (err) {
      failed++;
      // A TypeError from fetch almost always means CORS or network unreachable
      if (err instanceof TypeError) corsBlocked = true;
    }
  }
  return { success, failed, corsBlocked };
}
