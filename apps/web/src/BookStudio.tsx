import React, { useMemo, useState } from 'react';
import './bookStudio.css';

type Section = 'frontmatter' | 'main' | 'endmatter';
type Page = { id: string; section: Section; title: string; content: string; showPageNumber: boolean };

const templates: Record<Section, Array<Omit<Page, 'id'>>> = {
  frontmatter: [
    { section: 'frontmatter', title: 'Schmutztitel', content: 'Buchtitel', showPageNumber: false },
    { section: 'frontmatter', title: 'Leerseite', content: '', showPageNumber: false },
    { section: 'frontmatter', title: 'Titelseite', content: 'Buchtitel\nUntertitel\nChristopher Fandrich', showPageNumber: false },
    { section: 'frontmatter', title: 'Impressum', content: '© Christopher Fandrich\nAlle Rechte vorbehalten.', showPageNumber: false },
    { section: 'frontmatter', title: 'Dieses Buch gehört', content: 'Dieses Buch gehört: ____________________', showPageNumber: false },
    { section: 'frontmatter', title: 'Willkommen', content: 'Willkommen in diesem Buch!', showPageNumber: true },
    { section: 'frontmatter', title: 'Inhaltsverzeichnis', content: 'Wird aus den ausgewählten Seiten erzeugt.', showPageNumber: true }
  ],
  main: [
    { section: 'main', title: 'Kapitelstart', content: 'Kapitel 1', showPageNumber: false },
    { section: 'main', title: 'Textseite', content: 'Hier beginnt dein Buchinhalt.', showPageNumber: true },
    { section: 'main', title: 'Illustrationsseite', content: 'Platz für eine Illustration', showPageNumber: true },
    { section: 'main', title: 'Leerseite', content: '', showPageNumber: false }
  ],
  endmatter: [
    { section: 'endmatter', title: 'Weitere Bücher', content: 'Entdecke weitere Bücher von CH.FANDRICH®.', showPageNumber: true },
    { section: 'endmatter', title: 'Zertifikat', content: 'Herzlichen Glückwunsch!', showPageNumber: true },
    { section: 'endmatter', title: 'Bewertungsseite', content: 'Hat dir das Buch gefallen? Eine ehrliche Bewertung hilft sehr.', showPageNumber: true },
    { section: 'endmatter', title: 'Danksagung', content: 'Danke an alle, die dieses Buch unterstützt haben.', showPageNumber: true },
    { section: 'endmatter', title: 'Über den Autor', content: 'Christopher Fandrich ist Autor kreativer Kinder- und Beschäftigungsbücher.', showPageNumber: true }
  ]
};

const labels: Record<Section, string> = { frontmatter: 'Frontmatter', main: 'Hauptteil', endmatter: 'Endmatter' };

export default function BookStudio() {
  const [pages, setPages] = useState<Page[]>(() => {
    try { return JSON.parse(localStorage.getItem('chf-book-studio-pages') || '[]'); } catch { return []; }
  });
  const [bookTitle, setBookTitle] = useState(localStorage.getItem('chf-book-studio-title') || 'Mein neues Buch');

  const save = (next: Page[]) => {
    setPages(next);
    localStorage.setItem('chf-book-studio-pages', JSON.stringify(next));
  };

  const addPage = (template: Omit<Page, 'id'>) => save([...pages, { ...template, id: crypto.randomUUID() }]);
  const removePage = (id: string) => save(pages.filter(page => page.id !== id));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    [next[index], next[target]] = [next[target], next[index]];
    save(next);
  };

  const toc = useMemo(() => pages
    .map((page, index) => `${page.title} ${'.'.repeat(Math.max(3, 42 - page.title.length))} ${index + 1}`)
    .join('\n'), [pages]);

  const createStarterBook = () => {
    const selected = [
      ...templates.frontmatter.slice(0, 7),
      templates.main[0], templates.main[1],
      ...templates.endmatter
    ].map(page => ({ ...page, id: crypto.randomUUID(), content: page.title === 'Inhaltsverzeichnis' ? 'Automatisch erzeugt' : page.content }));
    save(selected);
  };

  const exportProject = () => {
    const payload = { version: 1, title: bookTitle, createdAt: new Date().toISOString(), pages, tableOfContents: toc };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${bookTitle.replace(/[^a-z0-9äöüß]+/gi, '-')}-Buchstruktur.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <div className="book-studio">
    <div className="panel-head">
      <div><p className="eyebrow">SPRINT 12</p><h2>KI-Buchstudio</h2><p>Baue Frontmatter, Hauptteil und Endmatter aus wiederverwendbaren Vorlagen zusammen.</p></div>
      <button onClick={createStarterBook}>Komplettes Grundbuch</button>
    </div>

    <label className="editor-field">Buchtitel
      <input value={bookTitle} onChange={event => { setBookTitle(event.target.value); localStorage.setItem('chf-book-studio-title', event.target.value); }} />
    </label>

    <div className="book-studio-layout">
      <section className="book-template-library">
        {(Object.keys(templates) as Section[]).map(section => <div key={section} className="book-template-section">
          <h3>{labels[section]}</h3>
          {templates[section].map(template => <button key={`${section}-${template.title}`} onClick={() => addPage(template)}>+ {template.title}</button>)}
        </div>)}
      </section>

      <section className="book-structure-list">
        <div className="book-structure-head"><strong>{pages.length} Seitenbausteine</strong><button onClick={() => save([])}>Leeren</button></div>
        {pages.length === 0 ? <p className="muted">Noch keine Seiten ausgewählt.</p> : pages.map((page, index) => <article className="book-structure-item" key={page.id}>
          <span>{index + 1}</span><div><small>{labels[page.section]}</small><strong>{page.title}</strong><p>{page.content || 'Leerseite'}</p></div>
          <div className="book-item-actions"><button onClick={() => move(index, -1)}>↑</button><button onClick={() => move(index, 1)}>↓</button><button onClick={() => removePage(page.id)}>×</button></div>
        </article>)}
      </section>

      <section className="book-toc-preview">
        <h3>Inhaltsverzeichnis</h3>
        <pre>{toc || 'Noch keine Einträge'}</pre>
        <button onClick={exportProject} disabled={!pages.length}>Buchstruktur exportieren</button>
      </section>
    </div>
  </div>;
}
