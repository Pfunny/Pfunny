import React, { useMemo, useState } from 'react';

type Check = { id:string; label:string; done:boolean };
const defaults:Check[]=[
  {id:'interior',label:'Innen-PDF geprüft',done:false},{id:'cover',label:'Cover-PDF geprüft',done:false},
  {id:'metadata',label:'Titel, Beschreibung und Keywords vollständig',done:false},{id:'categories',label:'Kategorien und Zielgruppe gewählt',done:false},
  {id:'price',label:'Preis und Märkte festgelegt',done:false},{id:'preview',label:'KDP-Druckvorschau kontrolliert',done:false},
  {id:'backup',label:'Projektbackup erstellt',done:false}
];

export default function PublishingCenter(){
  const [checks,setChecks]=useState<Check[]>(()=>JSON.parse(localStorage.getItem('studio-publish-checks')||'null')||defaults);
  const [price,setPrice]=useState(()=>localStorage.getItem('studio-publish-price')||'9.99');
  const [market,setMarket]=useState(()=>localStorage.getItem('studio-publish-market')||'Amazon.de');
  const [notes,setNotes]=useState(()=>localStorage.getItem('studio-publish-notes')||'');
  const score=useMemo(()=>Math.round(checks.filter(c=>c.done).length/checks.length*100),[checks]);
  const save=(next:Check[])=>{setChecks(next);localStorage.setItem('studio-publish-checks',JSON.stringify(next));};
  const toggle=(id:string)=>save(checks.map(c=>c.id===id?{...c,done:!c.done}:c));
  const persist=()=>{localStorage.setItem('studio-publish-price',price);localStorage.setItem('studio-publish-market',market);localStorage.setItem('studio-publish-notes',notes);};
  const exportReport=()=>{
    persist();
    const payload={createdAt:new Date().toISOString(),readiness:score,ready:score===100,price,market,notes,checks};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='KDP-Veroeffentlichungsbericht.json';a.click();URL.revokeObjectURL(a.href);
  };
  return <div className="publishing-center">
    <div className="panel-head"><div><h2>Veröffentlichungscenter</h2><p>Letzte Kontrolle vor dem KDP-Upload.</p></div><strong>{score}% uploadbereit</strong></div>
    <div className="progress"><i style={{width:`${score}%`}} /></div>
    <div className="two-columns">
      <section><h3>Upload-Checkliste</h3>{checks.map(c=><label className="setting" key={c.id}><span>{c.label}</span><input type="checkbox" checked={c.done} onChange={()=>toggle(c.id)} /></label>)}</section>
      <section><h3>Veröffentlichungsdaten</h3>
        <label className="editor-field">Hauptmarkt<select value={market} onChange={e=>setMarket(e.target.value)}><option>Amazon.de</option><option>Amazon.com</option><option>Amazon.co.uk</option></select></label>
        <label className="editor-field">Listenpreis (€)<input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} /></label>
        <label className="editor-field">Notizen<textarea rows={7} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="ISBN, Veröffentlichungstermin oder letzte Hinweise …" /></label>
        <button onClick={exportReport}>Abschlussbericht exportieren</button>
      </section>
    </div>
    <p className="muted">Der Bericht ersetzt nicht die abschließende Prüfung in der offiziellen KDP-Druckvorschau.</p>
  </div>;
}
