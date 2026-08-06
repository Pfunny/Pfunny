import React, { useMemo, useState } from 'react';
import './kdpPublisher.css';

type Meta={title:string;subtitle:string;series:string;volume:string;author:string;language:string;age:string;description:string;keywords:string[];categories:string[]};
const initial:Meta={title:'',subtitle:'',series:'',volume:'1',author:'Christopher Fandrich',language:'Deutsch',age:'6–9 Jahre',description:'',keywords:['','','','','','',''],categories:['Kinderbücher','Aktivitätsbücher']};
const key='studio-kdp-metadata';
const load=()=>{try{return JSON.parse(localStorage.getItem(key)||'null')||initial}catch{return initial}};
const download=(name:string,data:string,type='application/json')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)};

export default function KdpPublisher(){
 const [meta,setMeta]=useState<Meta>(load); const [step,setStep]=useState(1);
 const save=(next:Meta)=>{setMeta(next);localStorage.setItem(key,JSON.stringify(next));};
 const checks=useMemo(()=>[
  ['Titel',meta.title.trim().length>=3],['Autor',meta.author.trim().length>=3],['Beschreibung',meta.description.trim().length>=100],['7 Keywords',meta.keywords.filter(k=>k.trim()).length===7],['Kategorie',meta.categories.some(Boolean)],['Serie/Band',!meta.series.trim()||Number(meta.volume)>0]
 ] as [string,boolean][],[meta]);
 const score=Math.round(checks.filter(([,ok])=>ok).length/checks.length*100);
 const seo=useMemo(()=>{let n=0;if(meta.title.length>=15&&meta.title.length<=80)n+=30;if(meta.subtitle.length<=200)n+=15;if(meta.description.length>=150)n+=25;if(meta.keywords.filter(Boolean).length===7)n+=20;if(meta.categories.filter(Boolean).length>=2)n+=10;return n},[meta]);
 const set=(field:keyof Meta,value:any)=>save({...meta,[field]:value});
 const exportMap=()=>{
  const backup={projects:JSON.parse(localStorage.getItem('studio-projects')||'[]'),series:JSON.parse(localStorage.getItem('studio-series')||'[]'),pages:JSON.parse(localStorage.getItem('studio-book-pages')||'[]')};
  const report={createdAt:new Date().toISOString(),score,seo,checks:Object.fromEntries(checks),metadata:meta};
  download('KDP-Metadaten.json',JSON.stringify(meta,null,2));
  download('Projektbackup.json',JSON.stringify(backup,null,2));
  download('KDP-Checkbericht.json',JSON.stringify(report,null,2));
  const readme=`CH.FANDRICH Studio – KDP Projektmappe\n\nTitel: ${meta.title}\nUntertitel: ${meta.subtitle}\nAutor: ${meta.author}\nSerie: ${meta.series} Band ${meta.volume}\nSprache: ${meta.language}\nAltersgruppe: ${meta.age}\n\nBeschreibung:\n${meta.description}\n\nKeywords:\n${meta.keywords.join('\n')}\n\nKategorien:\n${meta.categories.join('\n')}\n\nVollständigkeit: ${score}%\nSEO-Wert: ${seo}%\n\nHinweis: Innen- und Cover-PDF werden weiterhin in den vorhandenen Exportmodulen erzeugt.`;
  download('README-KDP.txt',readme,'text/plain');
 };
 return <div className="kdp-publisher">
  <header className="kdp-hero"><div><span>KDP PUBLISHER PRO</span><h2>Metadaten & Veröffentlichung</h2><p>Alle Angaben zentral erfassen, prüfen und als Projektmappe exportieren.</p></div><div className="kdp-score"><b>{score}%</b><small>vollständig</small></div></header>
  <div className="kdp-tabs">{['Metadaten','SEO-Prüfung','Assistent','Projektmappe'].map((t,i)=><button key={t} className={step===i+1?'active':''} onClick={()=>setStep(i+1)}>{i+1}. {t}</button>)}</div>
  {step===1&&<section className="kdp-grid"><label>Titel<input value={meta.title} onChange={e=>set('title',e.target.value)}/></label><label>Untertitel<input value={meta.subtitle} onChange={e=>set('subtitle',e.target.value)}/></label><label>Serienname<input value={meta.series} onChange={e=>set('series',e.target.value)}/></label><label>Bandnummer<input type="number" min="1" value={meta.volume} onChange={e=>set('volume',e.target.value)}/></label><label>Autor<input value={meta.author} onChange={e=>set('author',e.target.value)}/></label><label>Sprache<input value={meta.language} onChange={e=>set('language',e.target.value)}/></label><label>Altersgruppe<input value={meta.age} onChange={e=>set('age',e.target.value)}/></label><label className="wide">Beschreibung<textarea rows={8} value={meta.description} onChange={e=>set('description',e.target.value)}/><small>{meta.description.length} Zeichen</small></label><div className="wide"><h3>7 Keywords</h3><div className="keyword-grid">{meta.keywords.map((v,i)=><input key={i} placeholder={`Keyword ${i+1}`} value={v} onChange={e=>{const a=[...meta.keywords];a[i]=e.target.value;set('keywords',a)}}/>)}</div></div><div className="wide"><h3>Kategorien</h3><div className="keyword-grid">{meta.categories.map((v,i)=><input key={i} value={v} onChange={e=>{const a=[...meta.categories];a[i]=e.target.value;set('categories',a)}}/>)}</div></div></section>}
  {step===2&&<section><div className="seo-card"><b>{seo}%</b><div><h3>SEO-Bewertung</h3><p>Titel 15–80 Zeichen, klare Beschreibung, sieben unterschiedliche Keywords und mindestens zwei Kategorien verbessern die Vorbereitung.</p></div></div><div className="check-list">{checks.map(([n,ok])=><div key={n} className={ok?'ok':'warn'}><span>{ok?'✓':'!'}</span><b>{n}</b><small>{ok?'erfüllt':'noch ergänzen'}</small></div>)}</div></section>}
  {step===3&&<section className="assistant-list">{['Metadaten vollständig erfassen','Titel und Beschreibung prüfen','Sieben Keywords ergänzen','Kategorien und Zielgruppe festlegen','Cover im Cover-Studio kontrollieren','Innen-PDF im Exportmodul erzeugen','Projektmappe exportieren und KDP-Vorschau verwenden'].map((x,i)=><div key={x}><span>{i+1}</span><p>{x}</p></div>)}</section>}
  {step===4&&<section className="export-card"><h3>Komplette Projektmappe</h3><p>Exportiert Metadaten, lokales Projektbackup, Prüfbericht und README. Innen- und Cover-PDF werden über die vorhandenen Module erzeugt.</p><button onClick={exportMap} disabled={score<50}>Projektmappe exportieren</button>{score<50&&<small>Mindestens 50 % Vollständigkeit erforderlich.</small>}</section>}
 </div>;
}
