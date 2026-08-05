import React,{useMemo,useState}from'react';

type Todo={level:'hoch'|'mittel'|'niedrig';title:string;detail:string;module:string};
const read=(key:string,fallback:any)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const array=(value:any)=>Array.isArray(value)?value:[];
const text=(value:any)=>typeof value==='string'?value.trim():'';

export default function AuthorAssistant(){
 const[refresh,setRefresh]=useState(0);
 const report=useMemo(()=>{
  const projects=array(read('studio-projects',[]));
  const pages=array(read('studio-book-pages',[]));
  const media=array(read('studio-media-library',[]));
  const metadata=read('studio-kdp-metadata',{});
  const cover=read('studio-cover-designer-pro',read('studio-cover-data',{}));
  const publishing=read('studio-publishing-center',{});
  const title=text(metadata.title||metadata.titel||cover.title);
  const subtitle=text(metadata.subtitle||metadata.untertitel||cover.subtitle);
  const description=text(metadata.description||metadata.beschreibung);
  const keywords=array(metadata.keywords).filter(Boolean);
  const categories=array(metadata.categories).filter(Boolean);
  const author=text(metadata.author||metadata.autor||cover.author);
  const todos:Todo[]=[];
  if(!projects.length)todos.push({level:'hoch',title:'Erstes Buchprojekt anlegen',detail:'Ohne Projekt kann der Assistent keine konkrete Buchanalyse durchführen.',module:'Projektvorlagen'});
  if(!pages.length)todos.push({level:'hoch',title:'Buchseiten anlegen',detail:'Frontmatter, Hauptteil und Endmatter fehlen noch im Buch-Editor.',module:'KI-Buchstudio'});
  if(!title)todos.push({level:'hoch',title:'Buchtitel ergänzen',detail:'Ein klarer, suchbarer Titel ist für KDP zwingend erforderlich.',module:'KDP Publisher'});
  if(!author)todos.push({level:'hoch',title:'Autorenname ergänzen',detail:'Der Autorenname fehlt in den KDP-Metadaten.',module:'KDP Publisher'});
  if(description.length<120)todos.push({level:'mittel',title:'Beschreibung ausbauen',detail:'Die Buchbeschreibung sollte Nutzen, Zielgruppe und Inhalt klar vermitteln.',module:'KDP Publisher'});
  if(keywords.length<7)todos.push({level:'mittel',title:`Keywords vervollständigen (${keywords.length}/7)`,detail:'Nutze alle sieben Keyword-Felder mit unterschiedlichen Suchphrasen.',module:'KDP Publisher'});
  if(categories.length<2)todos.push({level:'mittel',title:'Kategorien prüfen',detail:'Mindestens zwei passende Kategorien erleichtern die Einordnung des Buches.',module:'KDP Publisher'});
  if(!media.length)todos.push({level:'mittel',title:'Medien hinzufügen',detail:'Cover, Logos oder Illustrationen sind noch nicht in der Medienbibliothek hinterlegt.',module:'Medienbibliothek'});
  if(!text(cover.title)&&!cover.trimSize)todos.push({level:'hoch',title:'Cover vorbereiten',detail:'Es wurden noch keine vollständigen Cover-Daten erkannt.',module:'Cover-Designer Pro'});
  const checks=publishing.checks||publishing.steps||{};
  const done=Array.isArray(checks)?checks.filter(Boolean).length:Object.values(checks).filter(Boolean).length;
  if(done<7)todos.push({level:'hoch',title:'Veröffentlichungscheck abschließen',detail:`Aktuell sind ungefähr ${done} von 7 Upload-Schritten bestätigt.`,module:'Veröffentlichungscenter'});
  if(title.length>180)todos.push({level:'mittel',title:'Titel kürzen',detail:'Der Titel ist sehr lang und könnte in der Amazon-Suche schwer erfassbar sein.',module:'KDP Publisher'});
  if(!subtitle)todos.push({level:'niedrig',title:'Untertitel prüfen',detail:'Ein präziser Untertitel kann Zielgruppe und Nutzen deutlicher machen.',module:'KDP Publisher'});
  const scoreParts=[projects.length>0,pages.length>=8,!!title,!!author,description.length>=120,keywords.length>=7,categories.length>=2,media.length>0,!!(text(cover.title)||cover.trimSize),done>=7];
  const score=Math.round(scoreParts.filter(Boolean).length/scoreParts.length*100);
  const seo=Math.round(([title.length>=10&&title.length<=180,subtitle.length>0,description.length>=120,keywords.length>=7,categories.length>=2].filter(Boolean).length/5)*100);
  return{projects,pages,media,title,subtitle,description,keywords,categories,todos:todos.sort((a,b)=>({hoch:0,mittel:1,niedrig:2}[a.level]-({hoch:0,mittel:1,niedrig:2}[b.level])),score,seo};
 },[refresh]);
 const exportReport=()=>{const blob=new Blob([JSON.stringify({...report,createdAt:new Date().toISOString()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='KI-Autorenassistent-Bericht.json';a.click();URL.revokeObjectURL(a.href)};
 return <div className="author-assistant">
  <div className="assistant-summary">
   <div><span>Upload-Reife</span><strong>{report.score}%</strong><progress value={report.score} max="100"/></div>
   <div><span>SEO-Stand</span><strong>{report.seo}%</strong><progress value={report.seo} max="100"/></div>
   <div><span>Projekte</span><strong>{report.projects.length}</strong><small>{report.pages.length} Seiten erkannt</small></div>
   <div><span>Offene Aufgaben</span><strong>{report.todos.length}</strong><small>{report.todos.filter(t=>t.level==='hoch').length} hohe Priorität</small></div>
  </div>
  <section className="assistant-card"><div className="assistant-head"><div><h2>Projektanalyse</h2><p>Lokale Analyse deiner vorhandenen Studio-Daten. Es werden keine Daten versendet.</p></div><div className="assistant-actions"><button onClick={()=>setRefresh(v=>v+1)}>Neu analysieren</button><button onClick={exportReport}>Bericht exportieren</button></div></div>
   <div className="assistant-insights">
    <article><b>Stärke</b><p>{report.score>=80?'Das Projekt ist fast uploadbereit. Konzentriere dich auf die letzten Prüfungen.':report.pages.length?'Eine Buchstruktur ist vorhanden und kann gezielt vervollständigt werden.':'Die Studio-Grundlage ist eingerichtet; als Nächstes braucht es ein konkretes Buchprojekt.'}</p></article>
    <article><b>SEO-Hinweis</b><p>{report.seo>=80?'Titel, Beschreibung, Keywords und Kategorien sind weitgehend vollständig.':'Vervollständige Titel, Beschreibung, sieben Suchphrasen und passende Kategorien.'}</p></article>
    <article><b>Nächster Schritt</b><p>{report.todos[0]?.title||'Abschlussprüfung in der offiziellen KDP-Druckvorschau durchführen.'}</p></article>
   </div>
  </section>
  <section className="assistant-card"><h2>Priorisierte To-do-Liste</h2>{report.todos.length?<div className="assistant-todos">{report.todos.map((todo,index)=><article key={todo.title+index} className={`priority-${todo.level}`}><span>{todo.level}</span><div><h3>{todo.title}</h3><p>{todo.detail}</p><small>Zielmodul: {todo.module}</small></div></article>)}</div>:<div className="assistant-complete">✓ Alle automatisch prüfbaren Punkte sind erfüllt.</div>}</section>
 </div>
}
