import React, { useRef, useState } from 'react';

type Backup = {
  version?: string;
  exportedAt?: string;
  settings?: unknown;
  projects?: unknown[];
  series?: unknown[];
  pages?: unknown[];
};

const KEYS = {
  projects: 'studio-projects',
  series: 'studio-series',
  pages: 'studio-book-pages'
};

function readStored(key: string) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function downloadBackup() {
  const payload = {
    version: '0.8',
    exportedAt: new Date().toISOString(),
    projects: readStored(KEYS.projects),
    series: readStored(KEYS.series),
    pages: readStored(KEYS.pages)
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `CH-FANDRICH-Studio-Backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function validate(data: Backup) {
  if (!data || typeof data !== 'object') return 'Die Datei enthält kein gültiges Backup.';
  if (!Array.isArray(data.projects) || !Array.isArray(data.series) || !Array.isArray(data.pages)) {
    return 'Das Backup muss Projekte, Serien und Buchseiten enthalten.';
  }
  return null;
}

export default function DataManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<Backup | null>(null);

  const selectFile = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as Backup;
      const error = validate(data);
      if (error) { setMessage(error); setPending(null); return; }
      setPending(data);
      setMessage(`Backup erkannt: ${data.projects!.length} Projekte, ${data.series!.length} Serien und ${data.pages!.length} Seiten.`);
    } catch {
      setPending(null);
      setMessage('Die Datei konnte nicht gelesen werden. Bitte eine gültige JSON-Backupdatei auswählen.');
    }
  };

  const restore = () => {
    if (!pending) return;
    localStorage.setItem(KEYS.projects, JSON.stringify(pending.projects));
    localStorage.setItem(KEYS.series, JSON.stringify(pending.series));
    localStorage.setItem(KEYS.pages, JSON.stringify(pending.pages));
    setMessage('Backup erfolgreich wiederhergestellt. Die App wird neu geladen.');
    setTimeout(() => location.reload(), 500);
  };

  const clearAll = () => {
    if (!confirm('Wirklich alle lokal gespeicherten Studio-Daten löschen?')) return;
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    setMessage('Alle lokalen Projektdaten wurden gelöscht. Die App wird neu geladen.');
    setTimeout(() => location.reload(), 500);
  };

  return <div className="data-manager">
    <div className="data-manager-head">
      <div><p className="eyebrow">SPRINT 7</p><h2>Daten & Wiederherstellung</h2><p className="muted">Sichere deine Projekte und stelle sie auf einem anderen Gerät oder nach einer Neuinstallation wieder her.</p></div>
      <span className="data-version">v0.8</span>
    </div>

    <div className="data-cards">
      <article className="data-card">
        <span className="data-icon">↓</span><h3>Backup erstellen</h3>
        <p>Speichert Projekte, Serien und Buchseiten in einer einzigen JSON-Datei.</p>
        <button onClick={downloadBackup}>Backup herunterladen</button>
      </article>

      <article className="data-card">
        <span className="data-icon">↑</span><h3>Backup importieren</h3>
        <p>Prüft eine vorhandene Studio-Backupdatei, bevor lokale Daten ersetzt werden.</p>
        <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={event => selectFile(event.target.files?.[0])} />
        <button onClick={() => inputRef.current?.click()}>Datei auswählen</button>
        {pending && <button className="restore" onClick={restore}>Geprüftes Backup wiederherstellen</button>}
      </article>

      <article className="data-card danger-zone">
        <span className="data-icon">!</span><h3>Lokale Daten löschen</h3>
        <p>Entfernt alle Projekte, Serien und Buchseiten aus diesem Browser.</p>
        <button onClick={clearAll}>Alle lokalen Daten löschen</button>
      </article>
    </div>

    {message && <div className="data-message" role="status">{message}</div>}
    <p className="data-note">Backupdateien können sensible unveröffentlichte Buchinhalte enthalten. Bewahre sie an einem sicheren Ort auf.</p>
  </div>;
}
