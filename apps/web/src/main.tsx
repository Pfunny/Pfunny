import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Status = 'Idee' | 'In Arbeit' | 'Prüfung' | 'Uploadbereit';
type Project = { id: number; title: string; type: string; series: string; status: Status; progress: number };
type Series = { id: number; name: string; volumes: number; active: number };

const starterProjects: Project[] = [
  { id: 1, title: 'Drachenwelten – Band 1', type: 'Malbuch', series: 'Drachenwelten', status: 'In Arbeit', progress: 72 },
  { id: 2, title: 'Dinowelten Rätselbuch', type: 'Rätselbuch', series: 'Dinowelten', status: 'Prüfung', progress: 88 },
  { id: 3, title: 'Schlaf gut, kleiner Schatz', type: 'Kinderbuch', series: 'Gute-Nacht-Welten', status: 'Idee', progress: 24 }
];

const starterSeries: Series[] = [
  { id: 1, name: 'Tierwelten', volumes: 10, active: 4 },
  { id: 2, name: 'Drachenwelten', volumes: 6, active: 1 },
  { id: 3, name: 'Dinowelten', volumes: 4, active: 2 },
  { id: 4, name: 'Adventswelten', volumes: 3, active: 1 }
];

const templates = [
  ['Malbuch Premium', 'Frontmatter, 50 Motive, Leerseiten, Zertifikat'],
  ['Rätselbuch Kinder', 'Labyrinthe, Wortsuche, Schattenrätsel, Lösungen'],
  ['Gute-Nacht-Buch', 'Kapitelstruktur, Illustrationsseiten, Endmatter'],
  ['KDP Cover 8,5 × 11', 'Vorderseite, Rücken, Rückseite, Barcode-Freifläche']
];

function App() {
  const [view, setView] = useState('Dashboard');
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('studio-projects') || 'null') || starterProjects);
  const [series, setSeries] = useState<Series[]>(() => JSON.parse(localStorage.getItem('studio-series') || 'null') || starterSeries);
  const [dark, setDark] = useState(false);

  const saveProjects = (next: Project[]) => { setProjects(next); localStorage.setItem('studio-projects', JSON.stringify(next)); };
  const saveSeries = (next: Series[]) => { setSeries(next); localStorage.setItem('studio-series', JSON.stringify(next)); };

  const stats = useMemo(() => ({
    projects: projects.length,
    active: projects.filter(p => p.status === 'In Arbeit').length,
    ready: projects.filter(p => p.status === 'Uploadbereit').length,
    average: projects.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  }), [projects]);

  const addProject = () => {
    const title = prompt('Titel des neuen Buchprojekts:')?.trim();
    if (!title) return;
    const next: Project = { id: Date.now(), title, type: 'Malbuch', series: 'Ohne Serie', status: 'Idee', progress: 0 };
    saveProjects([next, ...projects]);
    setView('Projekte');
  };

  const addSeries = () => {
    const name = prompt('Name der neuen Buchserie:')?.trim();
    if (!name) return;
    saveSeries([{ id: Date.now(), name, volumes: 1, active: 1 }, ...series]);
    setView('Serien');
  };

  return <div className={dark ? 'app dark' : 'app'}>
    <aside className="sidebar">
      <div className="brand"><span>CH.FANDRICH®</span><strong>Studio</strong><small>v0.1 Sprint 1</small></div>
      <nav>{['Dashboard','Projekte','Serien','Vorlagen','Cover-Studio','Einstellungen'].map(item =>
        <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>
      )}</nav>
      <button className="theme" onClick={() => setDark(!dark)}>{dark ? 'Helles Design' : 'Dunkles Design'}</button>
    </aside>

    <main className="content">
      <header className="topbar"><div><p className="eyebrow">AUTORENPLATTFORM</p><h1>{view}</h1></div><button className="primary" onClick={addProject}>+ Neues Projekt</button></header>

      {view === 'Dashboard' && <>
        <section className="stats">
          <Stat label="Projekte" value={stats.projects} />
          <Stat label="In Arbeit" value={stats.active} />
          <Stat label="Uploadbereit" value={stats.ready} />
          <Stat label="Ø Fortschritt" value={`${stats.average}%`} />
        </section>
        <section className="panel"><div className="panel-head"><div><h2>Aktive Buchprojekte</h2><p>Deine wichtigsten Projekte auf einen Blick.</p></div><button onClick={() => setView('Projekte')}>Alle anzeigen</button></div><ProjectGrid projects={projects.slice(0,3)} onDelete={() => {}} /></section>
        <section className="two-columns"><div className="panel"><h2>Schnellaktionen</h2><div className="actions"><button onClick={addProject}>Buchprojekt anlegen</button><button onClick={addSeries}>Serie anlegen</button><button onClick={() => setView('Vorlagen')}>Vorlage auswählen</button><button onClick={() => setView('Cover-Studio')}>Cover-Studio öffnen</button></div></div><div className="panel"><h2>Serienstatus</h2>{series.slice(0,4).map(s => <div className="series-row" key={s.id}><span>{s.name}</span><strong>{s.active}/{s.volumes} aktiv</strong></div>)}</div></section>
      </>}

      {view === 'Projekte' && <section className="panel"><div className="panel-head"><div><h2>Projektverwaltung</h2><p>Projekte anlegen, verfolgen und organisieren.</p></div></div><ProjectGrid projects={projects} onDelete={(id) => saveProjects(projects.filter(p => p.id !== id))} /></section>}

      {view === 'Serien' && <section className="panel"><div className="panel-head"><div><h2>Serienverwaltung</h2><p>Buchreihen und Bände zentral verwalten.</p></div><button onClick={addSeries}>+ Serie</button></div><div className="series-grid">{series.map(s => <article className="series-card" key={s.id}><span className="series-icon">CF</span><h3>{s.name}</h3><p>{s.volumes} geplante Bände</p><div className="meter"><i style={{width:`${Math.min(100, (s.active/s.volumes)*100)}%`}} /></div><small>{s.active} aktive Projekte</small></article>)}</div></section>}

      {view === 'Vorlagen' && <section className="panel"><h2>Template-Bibliothek</h2><p className="muted">Wiederverwendbare Grundstrukturen für neue KDP-Projekte.</p><div className="template-grid">{templates.map(([name, desc]) => <article className="template" key={name}><span>VORLAGE</span><h3>{name}</h3><p>{desc}</p><button onClick={() => alert(`${name} wird im nächsten Sprint mit dem Buch-Editor verbunden.`)}>Verwenden</button></article>)}</div></section>}

      {view === 'Cover-Studio' && <section className="panel empty"><h2>Cover-Studio</h2><p>Der bestehende KDP-Cover-Designer wird im nächsten Integrationsschritt als React-Modul übernommen.</p><a href="../../kdp-toolbox/index.html">Aktuelle Version öffnen</a></section>}

      {view === 'Einstellungen' && <section className="panel"><h2>Einstellungen</h2><div className="setting"><div><strong>Darstellung</strong><p>Zwischen hellem und dunklem Design wechseln.</p></div><button onClick={() => setDark(!dark)}>{dark ? 'Hell' : 'Dunkel'}</button></div><div className="setting"><div><strong>Lokale Speicherung</strong><p>Projekte und Serien bleiben in diesem Browser gespeichert.</p></div><span className="badge">Aktiv</span></div></section>}
    </main>
  </div>;
}

function Stat({label, value}:{label:string; value:string|number}) { return <article className="stat"><span>{label}</span><strong>{value}</strong></article>; }
function ProjectGrid({projects,onDelete}:{projects:Project[];onDelete:(id:number)=>void}) { return <div className="project-grid">{projects.map(p => <article className="project-card" key={p.id}><div className="project-top"><span className={`status s-${p.status.replace(' ','-').toLowerCase()}`}>{p.status}</span>{onDelete && <button className="delete" onClick={() => onDelete(p.id)}>×</button>}</div><h3>{p.title}</h3><p>{p.type} · {p.series}</p><div className="progress"><i style={{width:`${p.progress}%`}} /></div><small>{p.progress}% abgeschlossen</small></article>)}</div>; }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
