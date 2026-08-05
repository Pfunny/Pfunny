import React, { useMemo, useState } from 'react';

type Preset = { name:string; format:string; style:string; negative:string };
const presets:Preset[] = [
  {name:'KDP-Cover Kinderbuch',format:'8,5 × 11 Zoll, Hochformat, 300 dpi',style:'professionelles, farbenfrohes Kinderbuch-Cover, klare Blickführung, große lesbare Titelfläche',negative:'unscharf, verzerrte Hände, unlesbarer Text, Wasserzeichen, Barcode im Motiv'},
  {name:'Ausmalbild Premium',format:'8,5 × 11 Zoll, Hochformat, Schwarz-Weiß',style:'saubere kräftige Konturen, große geschlossene Flächen, kinderfreundlich, ohne Graustufen',negative:'Farbe, Schattierung, Kreuzschraffur, abgeschnittene Motive, zu kleine Details'},
  {name:'Gute-Nacht-Illustration',format:'8,5 × 11 Zoll, Hochformat',style:'sanfte magische Kinderbuchillustration, ruhige Nachtfarben, warmes Licht, geborgene Stimmung',negative:'Horror, düster, aggressiv, Text, Logo, Wasserzeichen'},
  {name:'Serienlogo',format:'1:1, quadratisch, transparenter Hintergrund',style:'professionelles rundes Serienemblem, klare Symbolik, hochwertige Markenwirkung',negative:'Fotorealismus, unlesbare Schrift, komplexer Hintergrund, Mockup'}
];

export default function ImageStudio(){
  const [subject,setSubject]=useState('Ein freundlicher kleiner Drache in einer magischen Waldlichtung');
  const [preset,setPreset]=useState(0);
  const [details,setDetails]=useState('zentrierte Hauptfigur, viel freie Fläche, kindgerechte Gestaltung');
  const [negative,setNegative]=useState(presets[0].negative);
  const selected=presets[preset];
  const prompt=useMemo(()=>`${subject}. ${selected.style}. ${details}. Ausgabe: ${selected.format}. Drucktauglich und professionell für Amazon KDP.`,[subject,selected,details]);
  const copy=(value:string)=>navigator.clipboard?.writeText(value);
  const saveBrief=()=>{
    const items=JSON.parse(localStorage.getItem('chf-image-briefs')||'[]');
    items.unshift({id:crypto.randomUUID(),createdAt:new Date().toISOString(),preset:selected.name,prompt,negative});
    localStorage.setItem('chf-image-briefs',JSON.stringify(items.slice(0,50)));
    alert('Bildbrief wurde lokal gespeichert.');
  };
  const exportBrief=()=>{
    const blob=new Blob([JSON.stringify({preset:selected.name,prompt,negative,format:selected.format},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='CH-FANDRICH-Bildbrief.json';a.click();URL.revokeObjectURL(a.href);
  };
  return <div className="image-studio">
    <div className="panel-head"><div><p className="eyebrow">SPRINT 16</p><h2>KI-Bildstudio</h2><p>Erstelle konsistente Bildbriefings für Cover, Ausmalbilder, Illustrationen und Logos.</p></div></div>
    <div className="image-studio-grid">
      <section className="image-form">
        <label className="editor-field">Vorlage<select value={preset} onChange={e=>{const i=Number(e.target.value);setPreset(i);setNegative(presets[i].negative)}}>{presets.map((p,i)=><option key={p.name} value={i}>{p.name}</option>)}</select></label>
        <label className="editor-field">Motiv<textarea rows={4} value={subject} onChange={e=>setSubject(e.target.value)}/></label>
        <label className="editor-field">Zusätzliche Vorgaben<textarea rows={4} value={details} onChange={e=>setDetails(e.target.value)}/></label>
        <label className="editor-field">Negativvorgaben<textarea rows={4} value={negative} onChange={e=>setNegative(e.target.value)}/></label>
      </section>
      <section className="image-brief-preview">
        <span className="badge">{selected.format}</span><h3>Fertiger Bildprompt</h3><p>{prompt}</p><h3>Vermeiden</h3><p>{negative}</p>
        <div className="image-actions"><button onClick={()=>copy(prompt)}>Prompt kopieren</button><button onClick={()=>copy(negative)}>Negativprompt kopieren</button><button onClick={saveBrief}>Lokal speichern</button><button onClick={exportBrief}>JSON exportieren</button></div>
        <small className="muted">Dieses Modul bereitet Bildaufträge vor. Die eigentliche Bilderzeugung benötigt später eine angebundene Bild-API.</small>
      </section>
    </div>
  </div>;
}
