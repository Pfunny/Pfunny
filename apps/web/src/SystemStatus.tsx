import React, { useMemo } from 'react';

type Check = { label: string; ok: boolean; detail: string };

function safeArray(key: string) {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
}

export default function SystemStatus() {
  const projects = safeArray('studio-projects');
  const series = safeArray('studio-series');
  const pages = safeArray('studio-book-pages');
  const versions = safeArray('studio-version-history');

  const checks = useMemo<Check[]>(() => [
    { label: 'Lokaler Speicher', ok: typeof localStorage !== 'undefined', detail: 'Browser-Speicher ist verfügbar.' },
    { label: 'Projektstruktur', ok: projects.length > 0, detail: `${projects.length} Projekte erkannt.` },
    { label: 'Seriendaten', ok: series.length > 0, detail: `${series.length} Serien erkannt.` },
    { label: 'Buchseiten', ok: pages.length > 0, detail: `${pages.length} Seiten erkannt.` },
    { label: 'Versionsverlauf', ok: versions.length > 0, detail: `${versions.length} Sicherungspunkte gespeichert.` },
    { label: 'PWA-Unterstützung', ok: 'serviceWorker' in navigator, detail: 'Service Worker wird von diesem Browser unterstützt.' },
    { label: 'Online-Status', ok: navigator.onLine, detail: navigator.onLine ? 'Internetverbindung verfügbar.' : 'Offline-Modus aktiv.' }
  ], [projects.length, series.length, pages.length, versions.length]);

  const score = Math.round((checks.filter(check => check.ok).length / checks.length) * 100);
  const exportReport = () => {
    const report = { generatedAt: new Date().toISOString(), score, checks, counts: { projects: projects.length, series: series.length, pages: pages.length, versions: versions.length }, userAgent: navigator.userAgent };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'CH-FANDRICH-Systemdiagnose.json'; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="system-status">
    <div className="system-status-head"><div><p className="eyebrow">SPRINT 9</p><h2>Systemstatus & Diagnose</h2><p className="muted">Prüft lokale Projektdaten, Sicherungen, Browserfunktionen und Verbindungsstatus.</p></div><strong className={score >= 80 ? 'health good' : 'health warn'}>{score}%</strong></div>
    <div className="status-grid">{checks.map(check => <article className={`status-check ${check.ok ? 'ok' : 'warn'}`} key={check.label}><span>{check.ok ? '✓' : '!'}</span><div><strong>{check.label}</strong><p>{check.detail}</p></div></article>)}</div>
    <div className="status-actions"><button onClick={() => location.reload()}>Erneut prüfen</button><button onClick={exportReport}>Diagnosebericht exportieren</button></div>
    <p className="muted">Die Diagnose läuft ausschließlich lokal im Browser und sendet keine Projektdaten an externe Dienste.</p>
  </div>;
}
