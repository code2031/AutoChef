import React, { useState } from 'react';
import { Loader2, Check, AlertCircle, Settings } from 'lucide-react';
import { addToHAShoppingList } from '../lib/homeAssistant.js';
import { getGoogleAccessToken, addToGoogleTasks } from '../lib/googleTasks.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function ShoppingIntegrations({ items }) {
  const [haStatus, setHaStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [gtStatus, setGtStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [haMsg, setHaMsg] = useState('');
  const [gtMsg, setGtMsg] = useState('');
  const [gtToken, setGtToken] = useState(null);

  // Inline setup state
  const [showHaSetup, setShowHaSetup] = useState(false);
  const [showGtSetup, setShowGtSetup] = useState(false);
  const [haUrlInput, setHaUrlInput] = useState('');
  const [haTokenInput, setHaTokenInput] = useState('');
  const [gtClientIdInput, setGtClientIdInput] = useState('');

  const haUrl = (() => { try { return JSON.parse(localStorage.getItem('pref_ha_url') || '""'); } catch { return ''; } })();
  const haToken = (() => { try { return JSON.parse(localStorage.getItem('pref_ha_token') || '""'); } catch { return ''; } })();
  const googleClientId = GOOGLE_CLIENT_ID || (() => { try { return JSON.parse(localStorage.getItem('pref_google_client_id') || '""'); } catch { return ''; } })();

  const hasHA = !!(haUrl && haToken);
  const hasGoogle = !!googleClientId;

  if (!items || items.length === 0) return null;

  const saveHaCredentials = () => {
    localStorage.setItem('pref_ha_url', JSON.stringify(haUrlInput.trim()));
    localStorage.setItem('pref_ha_token', JSON.stringify(haTokenInput.trim()));
    setShowHaSetup(false);
    // Reload page to re-read credentials
    window.location.reload();
  };

  const saveGtCredentials = () => {
    localStorage.setItem('pref_google_client_id', JSON.stringify(gtClientIdInput.trim()));
    setShowGtSetup(false);
    window.location.reload();
  };

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
    <div className="space-y-3 pt-3 border-t border-white/5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Send to</p>
      <div className="space-y-2">
        {/* Home Assistant */}
        {hasHA ? (
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
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => { setShowHaSetup(v => !v); setShowGtSetup(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/10 text-slate-500 hover:text-sky-400 hover:border-sky-500/30 text-xs font-medium transition-all"
            >
              <span>🏠</span>
              Connect Home Assistant
              <Settings size={11} className="ml-auto opacity-60" />
            </button>
            {showHaSetup && (
              <div className="space-y-2 p-3 bg-slate-800/50 rounded-xl border border-white/5 text-xs">
                <input
                  type="url"
                  placeholder="http://homeassistant.local:8123"
                  value={haUrlInput}
                  onChange={e => setHaUrlInput(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
                <input
                  type="password"
                  placeholder="Long-Lived Access Token"
                  value={haTokenInput}
                  onChange={e => setHaTokenInput(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
                <button
                  onClick={saveHaCredentials}
                  disabled={!haUrlInput.trim() || !haTokenInput.trim()}
                  className="w-full py-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 disabled:opacity-40 transition-all font-medium"
                >
                  Save & Connect
                </button>
              </div>
            )}
          </div>
        )}

        {/* Google Tasks */}
        {hasGoogle ? (
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
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => { setShowGtSetup(v => !v); setShowHaSetup(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/10 text-slate-500 hover:text-green-400 hover:border-green-500/30 text-xs font-medium transition-all"
            >
              <span>📋</span>
              Connect Google Tasks
              <Settings size={11} className="ml-auto opacity-60" />
            </button>
            {showGtSetup && (
              <div className="space-y-2 p-3 bg-slate-800/50 rounded-xl border border-white/5 text-xs">
                <p className="text-slate-500 text-[11px]">Enter your Google OAuth Client ID (create one at <span className="text-slate-400">console.cloud.google.com</span>)</p>
                <input
                  type="text"
                  placeholder="Google Client ID (xxxx.apps.googleusercontent.com)"
                  value={gtClientIdInput}
                  onChange={e => setGtClientIdInput(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-green-500/50"
                />
                <button
                  onClick={saveGtCredentials}
                  disabled={!gtClientIdInput.trim()}
                  className="w-full py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-40 transition-all font-medium"
                >
                  Save & Connect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
