import React, { useMemo, useState } from 'react';

type PuzzleType = 'Labyrinth' | 'Wortsuche' | 'Schattenrätsel' | 'Fehlerbild';
type Difficulty = 'Leicht' | 'Mittel' | 'Schwer';

const rules: Record<PuzzleType,string> = {
  Labyrinth: 'klarer Start und Ziel, genau ein lösbarer Hauptweg, keine markierte Lösungsspur, ausreichend breite Wege, keine geschlossenen Sackgassen am Start oder Ziel',
  Wortsuche: 'gut lesbares Buchstabenraster, eindeutige Wortliste, Wörter waagerecht, senkrecht und diagonal, keine unzulässigen Begriffe, separate farbige Lösungsversion',
  Schattenrätsel: 'ein Hauptmotiv und vier bis sechs klar unterscheidbare Schatten, genau eine richtige Lösung, keine abgeschnittenen Figuren',
  Fehlerbild: 'zwei nahezu gleiche kindgerechte Szenen, fünf bis zehn eindeutige Unterschiede, separate Lösungsliste, keine winzigen Druckdetails'
};

export default function ActivityGenerator(){
  const [type,setType]=useState<PuzzleType>('Labyrinth');
  const [difficulty,setDifficulty]=useState<Difficulty>('Mittel');
  const [theme,setTheme]=useState('freundliche Dinosaurier');
  const [count,setCount]=useState(20);
  const [solutions,setSolutions]=useState(true);

  const jobs=useMemo(()=>Array.from({length:Math.max(1,Math.min(100,count))},(_,i)=>({
    number:i+1,
    type,
    prompt:`Erstelle Rätsel ${String(i+1).padStart(2,'0')}: ${type} zum Thema ${theme}. Schwierigkeitsgrad ${difficulty}. ${rules[type]}. Schwarz-Weiß, druckoptimiert, 8,5 × 11 Zoll Hochformat, 300 dpi, große klare Elemente, kindersicher, ohne Wasserzeichen.`,
    solution:solutions?`Erstelle die eindeutige Lösung zu Rätsel ${String(i+1).padStart(2,'0')} (${type}) separat und gut erkennbar.`:''
  })),[type,difficulty,theme,count,solutions]);

  const copyAll=()=>navigator.clipboard.writeText(jobs.map(j=>`${j.prompt}${j.solution?`\nLÖSUNG: ${j.solution}`:''}`).join('\n\n'));
  const exportJson=()=>{
    const payload={version:1,createdAt:new Date().toISOString(),format:'8.5x11 portrait, 300 dpi',type,difficulty,theme,solutions,jobs};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${type}-Rätselauftrag.json`;a.click();URL.revokeObjectURL(a.href);
  };

  return <div>
    <div className="panel-head"><div><p className="eyebrow">SPRINT 19</p><h2>Rätsel- & Aktivitätsgenerator</h2><p>Plane druckfertige Rätselstapel mit getrennten Lösungsaufträgen.</p></div></div>
    <div className="two-columns">
      <section>
        <label className="editor-field">Rätselart<select value={type} onChange={e=>setType(e.target.value as PuzzleType)}><option>Labyrinth</option><option>Wortsuche</option><option>Schattenrätsel</option><option>Fehlerbild</option></select></label>
        <label className="editor-field">Thema<input value={theme} onChange={e=>setTheme(e.target.value)}/></label>
        <label className="editor-field">Schwierigkeit<select value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}><option>Leicht</option><option>Mittel</option><option>Schwer</option></select></label>
        <label className="editor-field">Anzahl Rätsel<input type="number" min="1" max="100" value={count} onChange={e=>setCount(Number(e.target.value))}/></label>
        <label className="check"><input type="checkbox" checked={solutions} onChange={e=>setSolutions(e.target.checked)}/>Separate Lösungen erzeugen</label>
        <div className="actions" style={{marginTop:16}}><button onClick={copyAll}>Alle Aufträge kopieren</button><button onClick={exportJson}>Buchauftrag exportieren</button></div>
      </section>
      <section>
        <h3>{jobs.length} vorbereitete Rätsel</h3>
        <div style={{maxHeight:520,overflow:'auto',display:'grid',gap:10}}>{jobs.map(job=><article className="template" key={job.number}><span>{job.type} {String(job.number).padStart(2,'0')}</span><p>{job.prompt}</p>{job.solution&&<small><strong>Lösung:</strong> {job.solution}</small>}</article>)}</div>
      </section>
    </div>
  </div>;
}
