import React, { useMemo, useState } from 'react';

type BookPage = { id: number; section: string; title: string; body: string; pageNumber: boolean };
type Check = { level: 'ok' | 'warn'; title: string; detail: string };

const formats: Record<string, [number, number]> = {
  '8.5x11': [8.5, 11],
  '8.5x8.5': [8.5, 8.5],
  '8x10': [8, 10],
  '6x9': [6, 9]
};

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ExportStudio() {
  const [format, setFormat] = useState('8.5x11');
  const [bleed, setBleed] = useState(true);
  const [margin, setMargin] = useState(0.375);
  const [paper, setPaper] = useState('white');
  const pages = readJson<BookPage[]>('studio-book-pages', []);
  const projects = readJson<unknown[]>('studio-projects', []);
  const series = readJson<unknown[]>('studio-series', []);
  const [width, height] = formats[format];

  const checks = useMemo<Check[]>(() => {
    const result: Check[] = [];
    result.push({ level: pages.length >= 24 ? 'ok' : 'warn', title: 'Seitenanzahl', detail: pages.length >= 24 ? `${pages.length} Seiten erkannt.` : `Nur ${pages.length} Seiten erkannt; viele KDP-Druckformate benötigen mindestens 24 Seiten.` });
    result.push({ level: pages.length % 2 === 0 ? 'ok' : 'warn', title: 'Gerade Seitenzahl', detail: pages.length % 2 === 0 ? 'Die Seitenanzahl ist gerade.' : 'Die Seitenanzahl ist ungerade; prüfe die letzte Seite.' });
    result.push({ level: margin >= 0.375 ? 'ok' : 'warn', title: 'Sicherheitsrand', detail: margin >= 0.375 ? `${margin.toFixed(3)} Zoll Innenabstand eingestellt.` : 'Der eingestellte Sicherheitsrand ist sehr knapp.' });
    result.push({ level: bleed ? 'ok' : 'warn', title: 'Beschnitt', detail: bleed ? 'Beschnitt ist für randabfallende Inhalte aktiviert.' : 'Ohne Beschnitt dürfen Inhalte nicht bis zum Seitenrand reichen.' });
    result.push({ level: pages.every(page => page.title.trim().length > 0) ? 'ok' : 'warn', title: 'Seitentitel', detail: pages.every(page => page.title.trim().length > 0) ? 'Alle Seiten besitzen einen Titel.' : 'Mindestens eine Seite besitzt keinen Titel.' });
    result.push({ level: pages.every(page => page.body.trim().length > 0) ? 'ok' : 'warn', title: 'Seiteninhalt', detail: pages.every(page => page.body.trim().length > 0) ? 'Alle Seiten enthalten Inhalt oder einen Bildhinweis.' : 'Mindestens eine Seite ist leer.' });
    return result;
  }, [pages, bleed, margin]);

  const exportBackup = () => download('CH-FANDRICH-Studio-Projekt.json', JSON.stringify({ version: '0.6', exportedAt: new Date().toISOString(), settings: { format, width, height, bleed, margin, paper }, projects, series, pages }, null, 2));
  const exportReport = () => download('KDP-Pruefbericht.txt', [`CH.FANDRICH Studio – KDP-Prüfbericht`, `Format: ${width} × ${height} Zoll`, `Beschnitt: ${bleed ? 'Ja' : 'Nein'}`, `Sicherheitsrand: ${margin} Zoll`, '', ...checks.map(check => `${check.level === 'ok' ? 'OK' : 'WARNUNG'} – ${check.title}: ${check.detail}`), '', 'Hinweis: Vor dem Upload immer die aktuelle offizielle KDP-Vorlage und Druckvorschau verwenden.'].join('\n'), 'text/plain;charset=utf-8');

  const printInterior = () => {
    document.documentElement.style.setProperty('--print-width', `${width}in`);
    document.documentElement.style.setProperty('--print-height', `${height}in`);
    document.documentElement.style.setProperty('--print-margin', `${margin}in`);
    document.body.classList.add('printing-interior');
    requestAnimationFrame(() => window.print());
    setTimeout(() => document.body.classList.remove('printing-interior'), 700);
  };

  return <div className="export-studio">
    <div className="export-header"><div><p className="eyebrow">SPRINT 4</p><h2>PDF-Export & KDP-Prüfung</h2><p className="muted">Bereite Buchinnenseiten vor, prüfe typische Fehler und speichere das Projekt.</p></div><span className="export-version">v0.6</span></div>

    <div className="export-grid">
      <section className="export-settings">
        <h3>Ausgabeeinstellungen</h3>
        <label>Seitenformat<select value={format} onChange={event => setFormat(event.target.value)}>{Object.entries(formats).map(([key, value]) => <option key={key} value={key}>{value[0]} × {value[1]} Zoll</option>)}</select></label>
        <label>Papier<select value={paper} onChange={event => setPaper(event.target.value)}><option value="white">Weiß</option><option value="cream">Creme</option><option value="color">Farbe</option></select></label>
        <label>Sicherheitsrand (Zoll)<input type="number" min="0.25" step="0.025" value={margin} onChange={event => setMargin(Math.max(0.25, Number(event.target.value) || 0.25))} /></label>
        <label className="check"><input type="checkbox" checked={bleed} onChange={event => setBleed(event.target.checked)} /> Beschnitt berücksichtigen</label>
        <div className="export-summary"><strong>{width} × {height} Zoll</strong><span>{pages.length} Buchseiten</span><span>{bleed ? 'mit Beschnitt' : 'ohne Beschnitt'}</span></div>
      </section>

      <section className="export-checks">
        <h3>KDP-Prüfung</h3>
        {checks.map(check => <article key={check.title} className={`check-result ${check.level}`}><span>{check.level === 'ok' ? '✓' : '!'}</span><div><strong>{check.title}</strong><p>{check.detail}</p></div></article>)}
      </section>
    </div>

    <section className="export-actions">
      <button onClick={printInterior}>Innen-PDF drucken</button>
      <button onClick={() => window.dispatchEvent(new CustomEvent('studio-print-cover'))}>Cover zum Drucken öffnen</button>
      <button onClick={exportBackup}>Projekt-Backup herunterladen</button>
      <button onClick={exportReport}>Prüfbericht herunterladen</button>
    </section>

    <p className="export-note">Der PDF-Export nutzt den Druckdialog des Browsers. Wähle dort „Als PDF speichern“, 100 % Skalierung und keine zusätzlichen Kopf- oder Fußzeilen. Die Prüfung ist eine technische Vorprüfung und ersetzt nicht die aktuelle KDP-Druckvorschau.</p>

    <div className="print-interior" aria-hidden="true">
      {pages.map((page, index) => <article className="print-page" key={page.id}><div className="print-safe"><small>{page.section}</small><h1>{page.title}</h1><p>{page.body}</p>{page.pageNumber && <span className="print-page-number">{index + 1}</span>}</div></article>)}
    </div>
  </div>;
}
