import React, { useRef, useState } from 'react';
import { X, Download, Upload, Check } from 'lucide-react';

export default function RecipeJsonBackup({ history, onImport, onClose }) {
  const [imported, setImported] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autochef-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error('Expected an array of recipes');
        onImport(data);
        setImported(true);
        setTimeout(() => { setImported(false); onClose(); }, 1500);
      } catch (err) {
        setImportError(err.message || 'Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">📦 Backup & Restore</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl hover:bg-green-500/15 transition-all"
          >
            <Download size={18} />
            <div className="text-left">
              <p className="font-semibold text-sm">Export all recipes</p>
              <p className="text-xs text-green-400/60">{history.length} recipes → .json file</p>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${imported ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/15'}`}
          >
            {imported ? <Check size={18} /> : <Upload size={18} />}
            <div className="text-left">
              <p className="font-semibold text-sm">{imported ? 'Imported!' : 'Import backup'}</p>
              <p className="text-xs opacity-60">Merges with existing recipes</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          {importError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{importError}</p>
          )}
        </div>

        <p className="text-xs text-slate-600 mt-4 text-center">Import merges by recipe ID — duplicates are skipped</p>
      </div>
    </div>
  );
}
