import React, { useMemo, useState } from 'react';

type Tool = 'Ideen' | 'Titel' | 'Klappentext' | 'Keywords';

const themes: Record<string, string[]> = {
  Malbuch: ['freundliche Tiere', 'magische Drachen', 'Dinosaurier-Abenteuer', 'Wintertiere', 'Unterwasserwelten'],
  Rätselbuch: ['Dinosaurier', 'Weltraum', 'Piraten', 'Waldtiere', 'Feen und Einhörner'],
  Kinderbuch: ['Mut und Freundschaft', 'sanfte Gute-Nacht-Abenteuer', 'Gefühle verstehen', 'erste Entdeckungen', 'magische Reisen'],
  Sachbuch: ['KDP für Einsteiger', 'kreatives Schreiben', 'Selbstorganisation', 'Achtsamkeit', 'persönliche Entwicklung']
};

const adjectives = ['magisch', 'groß', 'wunderbar', 'spannend', 'liebevoll', 'kreativ', 'abenteuerlich'];
const benefits = ['fördert Kreativität und Konzentration', 'sorgt für entspannte Beschäftigung', 'stärkt Fantasie und Selbstvertrauen', 'bietet abwechslungsreichen Rätselspaß'];

function pick<T>(items: T[], index: number) { return items[index % items.length]; }
function copy(text: string) { navigator.clipboard?.writeText(text); }

export default function AITools() {
  const [tool, setTool] = useState<Tool>('Ideen');
  const [bookType, setBookType] = useState('Malbuch');
  const [topic, setTopic] = useState('Drachen');
  const [audience, setAudience] = useState('Kinder von 4 bis 8 Jahren');
  const [tone, setTone] = useState('fröhlich und hochwertig');
  const [seed, setSeed] = useState(1);

  const output = useMemo(() => {
    const cleanTopic = topic.trim() || pick(themes[bookType] || themes.Malbuch, seed);
    if (tool === 'Ideen') return Array.from({length: 6}, (_, i) => `${i + 1}. ${pick(adjectives, seed + i)}es ${bookType} über ${cleanTopic}: ${pick(benefits, seed + i)}.`).join('\n');
    if (tool === 'Titel') return [
      `${cleanTopic}welten – Das große ${bookType}`,
      `Mein ${pick(adjectives, seed)}es ${cleanTopic}-${bookType}`,
      `${cleanTopic} für Kinder – Entdecken, Lernen und Spaß haben`,
      `Das ultimative ${cleanTopic}-${bookType} für ${audience}`,
      `${cleanTopic}-Abenteuer: ${bookType} mit 50 abwechslungsreichen Seiten`
    ].join('\n');
    if (tool === 'Klappentext') return `Willkommen in einer ${tone}en Welt voller ${cleanTopic}! Dieses ${bookType} wurde speziell für ${audience} entwickelt. Abwechslungsreiche Inhalte laden zum Entdecken, Mitmachen und kreativen Gestalten ein. Das Buch ${pick(benefits, seed)} und eignet sich wunderbar als Geschenk für Geburtstage, Feiertage oder kleine Auszeiten im Alltag.\n\nHighlights:\n• kindgerechte und übersichtliche Gestaltung\n• abwechslungsreiche Aufgaben und Motive\n• ideal für zu Hause und unterwegs\n• liebevoll entwickelt von CH.FANDRICH®`;
    return [`${cleanTopic} ${bookType} Kinder`, `${bookType} ${audience}`, `${cleanTopic} Beschäftigungsbuch`, `kreatives Lernen ${cleanTopic}`, `${cleanTopic} Geschenk Kinder`, `${bookType} ohne Bildschirm`, `${cleanTopic} Abenteuer Buch`].join('\n');
  }, [tool, bookType, topic, audience, tone, seed]);

  return <div className="ai-tools">
    <div className="ai-head"><div><p className="eyebrow">SPRINT 5</p><h2>KI-Werkzeuge</h2><p className="muted">Lokale Textassistenten für Ideen, Titel, Klappentexte und Keywords – ohne API-Schlüssel.</p></div><span className="ai-badge">v0.8</span></div>
    <div className="ai-tabs">{(['Ideen','Titel','Klappentext','Keywords'] as Tool[]).map(item => <button key={item} className={tool === item ? 'active' : ''} onClick={() => setTool(item)}>{item}</button>)}</div>
    <div className="ai-layout">
      <section className="ai-form">
        <label>Buchart<select value={bookType} onChange={e => setBookType(e.target.value)}><option>Malbuch</option><option>Rätselbuch</option><option>Kinderbuch</option><option>Sachbuch</option></select></label>
        <label>Thema<input value={topic} onChange={e => setTopic(e.target.value)} placeholder="z. B. Drachen, Wintertiere, Weltraum" /></label>
        <label>Zielgruppe<input value={audience} onChange={e => setAudience(e.target.value)} /></label>
        <label>Stil<input value={tone} onChange={e => setTone(e.target.value)} /></label>
        <button onClick={() => setSeed(value => value + 1)}>Neu generieren</button>
      </section>
      <section className="ai-result"><div className="ai-result-head"><strong>Ergebnis</strong><button onClick={() => copy(output)}>Kopieren</button></div><textarea readOnly value={output} rows={18} /><p>Die Vorschläge sind Entwürfe. Prüfe Titel, Keywords und Aussagen vor Veröffentlichung immer manuell.</p></section>
    </div>
  </div>;
}
