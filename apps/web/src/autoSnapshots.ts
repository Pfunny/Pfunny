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
const WATCH_KEYS = ['studio-projects', 'studio-series', 'studio-book-pages'];
const MAX_SNAPSHOTS = 20;
const MIN_INTERVAL_MS = 5 * 60 * 1000;
let timer = 0;

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

function signature() {
  return WATCH_KEYS.map(key => localStorage.getItem(key) || '').join('|');
}

function createAutomaticSnapshot() {
  const currentSignature = signature();
  if (!currentSignature.replaceAll('|', '')) return;
  const snapshots = readJson<Snapshot[]>(HISTORY_KEY, []);
  const last = snapshots[0];
  const lastSignature = last ? JSON.stringify([last.projects, last.series, last.pages]) : '';
  const currentData = {
    projects: readJson<unknown[]>('studio-projects', []),
    series: readJson<unknown[]>('studio-series', []),
    pages: readJson<unknown[]>('studio-book-pages', [])
  };
  const normalized = JSON.stringify([currentData.projects, currentData.series, currentData.pages]);
  if (normalized === lastSignature) return;
  if (last && Date.now() - new Date(last.createdAt).getTime() < MIN_INTERVAL_MS) return;

  const snapshot: Snapshot = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    label: `Automatische Sicherung ${new Date().toLocaleString('de-DE')}`,
    automatic: true,
    ...currentData
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([snapshot, ...snapshots].slice(0, MAX_SNAPSHOTS)));
}

function scheduleSnapshot() {
  window.clearTimeout(timer);
  timer = window.setTimeout(createAutomaticSnapshot, 1200);
}

const originalSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = (key: string, value: string) => {
  originalSetItem(key, value);
  if (WATCH_KEYS.includes(key)) scheduleSnapshot();
};

window.addEventListener('beforeunload', createAutomaticSnapshot);
window.addEventListener('DOMContentLoaded', createAutomaticSnapshot);
