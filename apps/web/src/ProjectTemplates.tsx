import React, { useMemo, useState } from 'react';

type Section = 'Frontmatter' | 'Hauptteil' | 'Endmatter';
type BookPage = { id: number; section: Section; title: string; body: string; pageNumber: boolean };
type Project = { id: number; title: string; type: string; series: string; status: 'Idee'; progress: number };

type Preset = {
  id: string;
  name: string;
  type: string;
  series: string;
  description: string;
  pages: Array<Omit<BookPage, 'id'>>;
};

const commonFrontmatter: Array<Omit<BookPage, 'id'>> = [
  { section: 'Frontmatter', title: 'Schmutztitel', body: 'Buchtitel', pageNumber: false },
  { section: 'Frontmatter', title: 'Leerseite', body: '', pageNumber: false },
  { section: 'Frontmatter', title: 'Titelseite', body: 'Buchtitel\nUntertitel\nChristopher Fandrich', pageNumber: false },
  { section: 'Frontmatter', title: 'Impressum', body: '© 2026 Christopher Fandrich\nAlle Rechte vorbehalten.', pageNumber: false },
  { section: 'Frontmatter', title: 'Dieses Buch gehört', body: 'Dieses Buch gehört: ____________________', pageNumber: false },
  { section: 'Frontmatter', title: 'Inhaltsverzeichnis', body: 'Wird im Buch-Editor aktualisiert.', pageNumber: true }
];

const commonEndmatter: Array<Omit<BookPage, 'id'>> = [
  { section: 'Endmatter', title: 'Weitere Bücher', body: 'Entdecke weitere Bücher von CH.FANDRICH®.', pageNumber: true },
  { section: 'Endmatter', title: 'Bewertungsseite', body: 'Eine ehrliche Bewertung hilft diesem Buch sehr.', pageNumber: true },
  { section: 'Endmatter', title: 'Danksagung', body: 'Danke an alle, die dieses Buch unterstützt haben.', pageNumber: true },
  { section: 'Endmatter', title: 'Über den Autor', body: 'Christopher Fandrich ist Autor kreativer Kinder- und Beschäftigungsbücher.', pageNumber: true }
];

const presets: Preset[] = [
  {
    id: 'coloring', name: 'Premium-Malbuch', type: 'Malbuch', series: 'Tierwelten',
    description: 'Frontmatter, Kapitelstart, Motivseite, Leerseite, Zertifikat und Endmatter.',
    pages: [...commonFrontmatter,
      { section: 'Hauptteil', title: 'Kapitel 1', body: 'Kapitelstartseite ohne Seitenzahl.', pageNumber: false },
      { section: 'Hauptteil', title: 'Ausmalbild 1', body: 'Illustrationsplatzhalter.', pageNumber: true },
      { section: 'Hauptteil', title: 'Leerseite', body: '', pageNumber: false },
      { section: 'Endmatter', title: 'Zertifikat', body: 'Herzlichen Glückwunsch!', pageNumber: true },
      ...commonEndmatter]
  },
  {
    id: 'puzzle', name: 'Kinder-Rätselbuch', type: 'Rätselbuch', series: 'Dinowelten',
    description: 'Einleitung, Rätselkapitel, Lösungsbereich und Endmatter.',
    pages: [...commonFrontmatter,
      { section: 'Hauptteil', title: 'So funktioniert dieses Buch', body: 'Kurze Hinweise für Kinder und Eltern.', pageNumber: true },
      { section: 'Hauptteil', title: 'Kapitel 1 – Labyrinthe', body: 'Kapitelstartseite.', pageNumber: false },
      { section: 'Hauptteil', title: 'Rätsel 1', body: 'Rätselplatzhalter ohne Lösungsspur.', pageNumber: true },
      { section: 'Hauptteil', title: 'Lösungen', body: 'Lösungsbereich am Buchende.', pageNumber: true },
      ...commonEndmatter]
  },
  {
    id: 'bedtime', name: 'Gute-Nacht-Geschichten', type: 'Kinderbuch', series: 'Gute-Nacht-Welten',
    description: 'Ruhiger Buchstart, Geschichtenstruktur, Illustration und Autorenseiten.',
    pages: [...commonFrontmatter,
      { section: 'Frontmatter', title: 'Widmung', body: 'Für alle kleinen Träumerinnen und Träumer.', pageNumber: false },
      { section: 'Hauptteil', title: 'Geschichte 1', body: 'Titel der ersten Gute-Nacht-Geschichte', pageNumber: false },
      { section: 'Hauptteil', title: 'Geschichtentext', body: 'Hier beginnt die Geschichte.', pageNumber: true },
      { section: 'Hauptteil', title: 'Illustrationsseite', body: 'Platz für eine ganzseitige Illustration.', pageNumber: true },
      ...commonEndmatter]
  }
];

export default function ProjectTemplates() {
  const [title, setTitle] = useState('Mein neues Buch');
  const [selectedId, setSelectedId] = useState(presets[0].id);
  const selected = useMemo(() => presets.find(item => item.id === selectedId) || presets[0], [selectedId]);

  const createProject = () => {
    const now = Date.now();
    const pages: BookPage[] = selected.pages.map((page, index) => ({ ...page, id: now + index + 1 }));
    const existingProjects: Project[] = JSON.parse(localStorage.getItem('studio-projects') || '[]');
    const project: Project = { id: now, title: title.trim() || selected.name, type: selected.type, series: selected.series, status: 'Idee', progress: 5 };
    localStorage.setItem('studio-projects', JSON.stringify([project, ...existingProjects]));
    localStorage.setItem('studio-book-pages', JSON.stringify(pages));
    localStorage.setItem('chf-last-template', selected.id);
    alert(`„${project.title}“ wurde angelegt und in den Buch-Editor übernommen.`);
    window.location.reload();
  };

  return <div className="project-template-studio">
    <div className="panel-head"><div><p className="eyebrow">SPRINT 13</p><h2>Projektvorlagen</h2><p>Lege komplette Buchprojekte an und übernimm die Seiten direkt in den Buch-Editor.</p></div></div>
    <label className="editor-field">Projektname<input value={title} onChange={event => setTitle(event.target.value)} /></label>
    <div className="template-preset-grid">
      {presets.map(preset => <button key={preset.id} className={selectedId === preset.id ? 'template-preset active' : 'template-preset'} onClick={() => setSelectedId(preset.id)}>
        <strong>{preset.name}</strong><span>{preset.type} · {preset.series}</span><p>{preset.description}</p><small>{preset.pages.length} Startseiten</small>
      </button>)}
    </div>
    <section className="template-summary">
      <div><h3>{selected.name}</h3><p>{selected.description}</p></div>
      <div><strong>{selected.pages.length}</strong><span>vorbereitete Seiten</span></div>
      <button onClick={createProject}>Projekt anlegen & übernehmen</button>
    </section>
  </div>;
}
