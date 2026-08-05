import React, { useMemo, useState } from 'react';
import './cover-studio.css';

type Format = { label: string; width: number; height: number };
type Paper = 'white' | 'cream' | 'color';

const formats: Format[] = [
  { label: '8,5 × 11 Zoll', width: 8.5, height: 11 },
  { label: '8,5 × 8,5 Zoll', width: 8.5, height: 8.5 },
  { label: '8 × 10 Zoll', width: 8, height: 10 },
  { label: '6 × 9 Zoll', width: 6, height: 9 }
];

const paperFactor: Record<Paper, number> = {
  white: 0.002252,
  cream: 0.0025,
  color: 0.002347
};

export default function CoverStudio() {
  const [formatIndex, setFormatIndex] = useState(0);
  const [pages, setPages] = useState(146);
  const [paper, setPaper] = useState<Paper>('white');
  const [bleed, setBleed] = useState(true);
  const [dpi, setDpi] = useState(300);
  const [title, setTitle] = useState('Drachenwelten');
  const [subtitle, setSubtitle] = useState('Das große Ausmalbuch für Kinder');
  const [author, setAuthor] = useState('Christopher Fandrich');
  const [backText, setBackText] = useState('Eine fantasievolle Reise voller freundlicher Drachen, großer Abenteuer und kreativer Ausmalmomente.');
  const [background, setBackground] = useState('#17324d');

  const measurements = useMemo(() => {
    const format = formats[formatIndex];
    const spine = Math.max(0, pages * paperFactor[paper]);
    const bleedValue = bleed ? 0.125 : 0;
    const totalWidth = format.width * 2 + spine + bleedValue * 2;
    const totalHeight = format.height + bleedValue * 2;
    return {
      format,
      spine,
      totalWidth,
      totalHeight,
      pixelsWidth: Math.round(totalWidth * dpi),
      pixelsHeight: Math.round(totalHeight * dpi)
    };
  }, [formatIndex, pages, paper, bleed, dpi]);

  const spinePreview = Math.max(18, Math.min(84, measurements.spine * 180));

  return <section className="cover-studio-layout">
    <aside className="cover-controls panel">
      <div className="panel-head"><div><h2>Cover-Einstellungen</h2><p>KDP-Umschlag technisch vorbereiten.</p></div></div>
      <label>Format<select value={formatIndex} onChange={e => setFormatIndex(Number(e.target.value))}>{formats.map((format, index) => <option key={format.label} value={index}>{format.label}</option>)}</select></label>
      <div className="cover-input-grid">
        <label>Seitenzahl<input type="number" min="24" max="828" value={pages} onChange={e => setPages(Math.max(24, Number(e.target.value) || 24))} /></label>
        <label>DPI<input type="number" min="72" max="600" value={dpi} onChange={e => setDpi(Math.max(72, Number(e.target.value) || 300))} /></label>
      </div>
      <label>Papier<select value={paper} onChange={e => setPaper(e.target.value as Paper)}><option value="white">Weißes Papier</option><option value="cream">Cremefarbenes Papier</option><option value="color">Farbpapier</option></select></label>
      <label className="check"><input type="checkbox" checked={bleed} onChange={e => setBleed(e.target.checked)} /> Beschnittzugabe berücksichtigen</label>

      <hr />
      <h3>Cover-Inhalt</h3>
      <label>Titel<input value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label>Untertitel<textarea rows={2} value={subtitle} onChange={e => setSubtitle(e.target.value)} /></label>
      <label>Autor<input value={author} onChange={e => setAuthor(e.target.value)} /></label>
      <label>Klappentext<textarea rows={5} value={backText} onChange={e => setBackText(e.target.value)} /></label>
      <label>Grundfarbe<input className="color-input" type="color" value={background} onChange={e => setBackground(e.target.value)} /></label>
    </aside>

    <div className="cover-main">
      <section className="cover-metrics panel">
        <article><span>Rückenbreite</span><strong>{measurements.spine.toFixed(3)} Zoll</strong><small>{(measurements.spine * 25.4).toFixed(2)} mm</small></article>
        <article><span>Gesamtformat</span><strong>{measurements.totalWidth.toFixed(3)} × {measurements.totalHeight.toFixed(3)} Zoll</strong><small>inklusive Beschnitt</small></article>
        <article><span>Pixel bei {dpi} DPI</span><strong>{measurements.pixelsWidth} × {measurements.pixelsHeight}</strong><small>Export-Arbeitsgröße</small></article>
      </section>

      <section className="panel cover-preview-panel">
        <div className="panel-head"><div><h2>Live-Umschlagvorschau</h2><p>Rückseite, Rücken und Vorderseite mit Sicherheitsbereichen.</p></div></div>
        <div className="cover-preview-wrap">
          <div className="full-cover" style={{ background }}>
            <section className="back-cover cover-side">
              <div className="cover-safe-zone">
                <span className="cover-brand">CH.FANDRICH®</span>
                <p>{backText}</p>
                <div className="barcode-space">ISBN / Barcode frei</div>
              </div>
            </section>
            <section className="spine-cover" style={{ width: spinePreview }}>
              <span>{title}</span><small>{author}</small>
            </section>
            <section className="front-cover cover-side">
              <div className="cover-safe-zone front-content">
                <span className="cover-series">CH.FANDRICH® WELTEN</span>
                <h2>{title || 'Buchtitel'}</h2>
                <p>{subtitle || 'Untertitel'}</p>
                <strong>{author || 'Autor'}</strong>
              </div>
            </section>
          </div>
        </div>
        <div className="cover-legend"><span><i className="safe-dot" /> Sicherheitsbereich</span><span><i className="barcode-dot" /> Barcode-Freifläche</span></div>
        <p className="cover-warning">Die Rückenbreite ist eine technische Vorberechnung. Vor dem finalen KDP-Upload immer mit der aktuell heruntergeladenen KDP-Covervorlage abgleichen.</p>
      </section>
    </div>
  </section>;
}
