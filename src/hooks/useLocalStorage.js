import { useState, useEffect } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Setter that reads from localStorage at write-time to avoid overwriting
  // data saved by other tabs that opened before this one.
  const setStoredValue = (updaterOrValue) => {
    setValue(prev => {
      // Read the freshest value from localStorage rather than trusting stale
      // in-memory state — critical when multiple tabs are open simultaneously.
      let current = prev;
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) current = JSON.parse(stored);
      } catch { /* fall back to in-memory prev */ }

      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(current)
        : updaterOrValue;

      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch { /* storage full */ }

      return next;
    });
  };

  // Keep this tab's state in sync when another tab writes to the same key.
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue !== null ? JSON.parse(e.newValue) : defaultValue);
      } catch { /* ignore malformed JSON */ }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, defaultValue]);

  return [value, setStoredValue];
}
