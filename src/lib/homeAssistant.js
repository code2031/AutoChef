/**
 * Home Assistant REST API shopping list integration.
 * User configures haUrl (e.g. http://homeassistant.local:8123) + haToken (long-lived access token).
 */
export async function addToHAShoppingList(items, haUrl, haToken) {
  let success = 0;
  let failed = 0;
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
    } catch {
      failed++;
    }
  }
  return { success, failed };
}
