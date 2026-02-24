import React, { useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { addToHAShoppingList } from '../lib/homeAssistant.js';
import { getGoogleAccessToken, addToGoogleTasks } from '../lib/googleTasks.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function ShoppingIntegrations({ items }) {
  const [haStatus, setHaStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [gtStatus, setGtStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [haMsg, setHaMsg] = useState('');
  const [gtMsg, setGtMsg] = useState('');
  const [gtToken, setGtToken] = useState(null);

  const haUrl = (() => { try { return JSON.parse(localStorage.getItem('pref_ha_url') || '""'); } catch { return ''; } })();
  const haToken = (() => { try { return JSON.parse(localStorage.getItem('pref_ha_token') || '""'); } catch { return ''; } })();
  const googleClientId = GOOGLE_CLIENT_ID || (() => { try { return JSON.parse(localStorage.getItem('pref_google_client_id') || '""'); } catch { return ''; } })();

  const hasHA = !!(haUrl && haToken);
  const hasGoogle = !!googleClientId;

  if (!hasHA && !hasGoogle) return null;
  if (!items || items.length === 0) return null;

  const handleHA = async () => {
    setHaStatus('loading');
    setHaMsg('');
    try {
      const { success, failed } = await addToHAShoppingList(items, haUrl, haToken);
      if (failed === 0) {
        setHaStatus('success');
        setHaMsg(`${success} item${success !== 1 ? 's' : ''} added`);
      } else {
        setHaStatus('error');
        setHaMsg(`${success} added, ${failed} failed (check CORS / token)`);
      }
    } catch {
      setHaStatus('error');
      setHaMsg('Connection failed — check HA URL and token');
    }
    setTimeout(() => setHaStatus(null), 4000);
  };

  const handleGoogleTasks = async () => {
    setGtStatus('loading');
    setGtMsg('');
    try {
      let token = gtToken;
      if (!token) {
        token = await getGoogleAccessToken(googleClientId);
        setGtToken(token);
      }
      const { success, failed } = await addToGoogleTasks(items, token);
      if (failed === 0) {
        setGtStatus('success');
        setGtMsg(`${success} task${success !== 1 ? 's' : ''} added to "AutoChef Shopping"`);
      } else {
        setGtStatus('error');
        setGtMsg(`${success} added, ${failed} failed`);
      }
    } catch (err) {
      setGtStatus('error');
      setGtMsg(err.message || 'Google authorization failed');
      setGtToken(null);
    }
    setTimeout(() => setGtStatus(null), 4000);
  };

  return (
    <div className="space-y-2 pt-3 border-t border-white/5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Send to</p>
      <div className="flex flex-wrap gap-2">
        {hasHA && (
          <div className="space-y-1">
            <button
              onClick={handleHA}
              disabled={haStatus === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 hover:bg-sky-500/20 text-xs font-medium transition-all disabled:opacity-50"
            >
              {haStatus === 'loading' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : haStatus === 'success' ? (
                <Check size={12} className="text-green-400" />
              ) : haStatus === 'error' ? (
                <AlertCircle size={12} className="text-red-400" />
              ) : (
                <span>🏠</span>
              )}
              Home Assistant
            </button>
            {haMsg && <p className={`text-[10px] ${haStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>{haMsg}</p>}
          </div>
        )}
        {hasGoogle && (
          <div className="space-y-1">
            <button
              onClick={handleGoogleTasks}
              disabled={gtStatus === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-all disabled:opacity-50"
            >
              {gtStatus === 'loading' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : gtStatus === 'success' ? (
                <Check size={12} />
              ) : gtStatus === 'error' ? (
                <AlertCircle size={12} className="text-red-400" />
              ) : (
                <span>📋</span>
              )}
              Google Tasks
            </button>
            {gtMsg && <p className={`text-[10px] ${gtStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>{gtMsg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
