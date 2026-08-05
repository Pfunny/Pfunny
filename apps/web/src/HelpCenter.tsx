import React, { useMemo, useState } from 'react';

const steps = [
  ['Projekt anlegen', 'Lege Titel, Buchart, Serie und Status fest.'],
  ['Buch strukturieren', 'Erstelle Frontmatter, Hauptteil und Endmatter im Buch-Editor.'],
  ['Cover vorbereiten', 'Stelle Format, Seitenzahl, Papier und Beschnitt im Cover-Studio ein.'],
  ['Inhalt prüfen', 'Kontrolliere Seiten, Sicherheitsränder und leere Inhalte.'],
  ['Backup erstellen', 'Speichere ein Projekt-Backup und einen manuellen Sicherungspunkt.'],
  ['PDF exportieren', 'Erzeuge Innen- und Cover-PDF über den Browser-Druckdialog.'],
  ['KDP-Vorschau prüfen', 'Prüfe die finalen Dateien immer zusätzlich in der offiziellen KDP-Vorschau.']
];

export default function HelpCenter() {
  const [done, setDone] = useState<boolean[]>(() => {
    try { return JSON.parse(localStorage.getItem('studio-onboarding') || '[]'); } catch { return []; }
  });
  const progress = useMemo(() => Math.round((done.filter(Boolean).length / steps.length) * 100), [done]);
  const toggle = (index: number) => {
    const next = steps.map((_, i) => i === index ? !done[i] : Boolean(done[i]));
    setDone(next);
    localStorage.setItem('studio-onboarding', JSON.stringify(next));
  };

  return <div>
    <div className="panel-head"><div><p className="eyebrow">SPRINT 10</p><h2>Hilfe & Projektstart</h2><p>Führe dein Buchprojekt Schritt für Schritt bis zur KDP-Prüfung.</p></div><strong>{progress}%</strong></div>
    <div className="progress"><i style={{ width: `${progress}%` }} /></div>
    <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
      {steps.map(([title, detail], index) => <label key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, border: '1px solid #e2e8f0', borderRadius: 14 }}>
        <input type="checkbox" checked={Boolean(done[index])} onChange={() => toggle(index)} />
        <span><strong>{index + 1}. {title}</strong><br /><small>{detail}</small></span>
      </label>)}
    </div>
    <div className="two-columns" style={{ marginTop: 22 }}>
      <section><h3>Schnellhilfe</h3><p className="muted">Nutze Systemstatus bei technischen Problemen, Daten & Backup vor größeren Änderungen und den Versionsverlauf für ältere Projektstände.</p></section>
      <section><h3>Wichtiger KDP-Hinweis</h3><p className="muted">Die Studio-Prüfungen sind Vorprüfungen. Maßgeblich bleiben die aktuelle KDP-Vorlage und die offizielle Druckvorschau.</p></section>
    </div>
  </div>;
}
