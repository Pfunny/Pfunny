import React, { useMemo, useState } from 'react';
import './versionHistory.css';

type Snapshot = {
  id: string;
  createdAt: string;
  label: string;
  automatic: boolean;
  projects: unknown[];
  series: unknown[];
  pages: unknown[];
};

const HISTORY_KEY = 'studio-version-history';
const MAX_SNAPSHOTS = 20;

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

function readSnapshots(): Snapshot[] {
  return readJson<Snapshot[]>(HISTORY_KEY, []);
}

function currentData() {
  return {
    projects: readJson<unknown[]>('studio-projects', []),
    series: readJson<unknown[]>('studio-series', []),
    pages: readJson<unknown[]>('studio-book-pages', [])
  };
}

function saveSnapshots(items: Snapshot[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_SNAPSHOTS)));
}

export default function VersionHistory() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(readSnapshots);
  const [message, setMessage] = useState('');

  const totals = useMemo(() => ({
    versions: snapshots.length,
    automatic: snapshots.filter(item => item.automatic).length,
    manual: snapshots.filter(item => !item.automatic).length
  }), [snapshots]);

  const createSnapshot = () => {
    const data = currentData();
    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      label: `Manuelle Sicherung ${new Date().toLocaleString('de-DE')}`,
      automatic: false,
      ...data
    };
    const next = [snapshot, ...snapshots].slice(0, MAX_SNAPSHOTS);
    saveSnapshots(next);
    setSnapshots(next);
    setMessage('Sicherungspunkt wurde erstellt.');
  };

  const restore = (snapshot: Snapshot) => {
    if (!confirm(`Projektstand vom ${new Date(snapshot.createdAt).toLocaleString('de-DE')} wiederherstellen?`)) return;
    localStorage.setItem('studio-projects', JSON.stringify(snapshot.projects));
    localStorage.setItem('studio-series', JSON.stringify(snapshot.series));
    localStorage.setItem('studio-book-pages', JSON.stringify(snapshot.pages));
    setMessage('Projektstand wurde wiederhergestellt. Die App wird neu geladen.');
    setTimeout(() => location.reload(), 500);
  };

  const remove = (id: string) => {
    const next = snapshots.filter(item => item.id !== id);
    saveSnapshots(next);
    setSnapshots(next);
    setMessage('Sicherungspunkt wurde gelöscht.');
  };

  const clearAll = () => {
    if (!confirm('Alle gespeicherten Sicherungspunkte löschen?')) return;
    localStorage.removeItem(HISTORY_KEY);
    setSnapshots([]);
    setMessage('Versionsverlauf wurde geleert.');
  };

  return <div className="version-history">
    <header className="version-header">
      <div><p className="eyebrow">SPRINT 8</p><h2>Versionsverlauf</h2><p className="muted">Speichere ältere Projektstände und stelle sie bei Bedarf wieder her.</p></div>
      <button onClick={createSnapshot}>+ Sicherungspunkt</button>
    </header>

    <section className="version-stats">
      <article><span>Gesamt</span><strong>{totals.versions}</strong></article>
      <article><span>Automatisch</span><strong>{totals.automatic}</strong></article>
      <article><span>Manuell</span><strong>{totals.manual}</strong></article>
    </section>

    {message && <p className="version-message">{message}</p>}

    <div className="version-list">
      {snapshots.length === 0 && <div className="version-empty"><h3>Noch keine Sicherungspunkte</h3><p>Beim Bearbeiten werden künftig automatisch Sicherungen angelegt. Du kannst auch sofort eine manuelle Version erstellen.</p></div>}
      {snapshots.map(snapshot => <article className="version-card" key={snapshot.id}>
        <div className="version-meta">
          <span className={snapshot.automatic ? 'auto' : 'manual'}>{snapshot.automatic ? 'AUTOMATISCH' : 'MANUELL'}</span>
          <h3>{snapshot.label}</h3>
          <p>{new Date(snapshot.createdAt).toLocaleString('de-DE')}</p>
        </div>
        <div className="version-counts">
          <span>{snapshot.projects.length} Projekte</span>
          <span>{snapshot.series.length} Serien</span>
          <span>{snapshot.pages.length} Seiten</span>
        </div>
        <div className="version-actions">
          <button onClick={() => restore(snapshot)}>Wiederherstellen</button>
          <button className="secondary" onClick={() => remove(snapshot.id)}>Löschen</button>
        </div>
      </article>)}
    </div>

    {snapshots.length > 0 && <button className="clear-history" onClick={clearAll}>Gesamten Versionsverlauf löschen</button>}
    <p className="version-note">Es werden maximal {MAX_SNAPSHOTS} Sicherungspunkte lokal im Browser gespeichert. Für zusätzliche Sicherheit weiterhin regelmäßig ein Projekt-Backup herunterladen.</p>
  </div>;
}
