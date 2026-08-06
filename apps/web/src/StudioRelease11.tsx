import React,{useMemo,useState}from'react';

type Check={id:string,label:string,done:boolean};
const KEY='studio-release-1-1-checks';
const defaults:Check[]=[
{id:'modules',label:'Alle neuen 1.1-Module im Menü geprüft',done:false},
{id:'kdp-import',label:'KDP-CSV-Import mit Beispieldatei geprüft',done:false},
{id:'analysis',label:'KDP-Analyse und Exporte geprüft',done:false},
{id:'marketing',label:'Marketing-Pro-Kampagnen geprüft',done:false},
{id:'advisor',label:'Business-Advisor-Empfehlungen geprüft',done:false},
{id:'mobile',label:'Darstellung auf Smartphone geprüft',done:false},
{id:'backup',label:'Lokales Backup vor Release erstellt',done:false},
{id:'notes',label:'Release-Hinweise gelesen und bestätigt',done:false}
];
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||defaults}catch{return defaults}};
const modules=['KDP-Berichtsimport','KDP-Analyse','Marketing Pro','Business Advisor','Verkaufsdashboard','Serienmanager Pro','Dokumenten-Center','Test & Release'];
export default function StudioRelease11(){
 const[checks,setChecks]=useState<Check[]>(load);
 const[notes,setNotes]=useState(localStorage.getItem('studio-release-1-1-notes')||'');
 const score=useMemo(()=>Math.round(checks.filter(x=>x.done).length/checks.length*100),[checks]);
 const save=(next:Check[])=>{setChecks(next);localStorage.setItem(KEY,JSON.stringify(next))};
 const toggle=(id:string)=>save(checks.map(x=>x.id===id?{...x,done:!x.done}:x));
 const exportReport=()=>{const report={version:'1.1.0',generatedAt:new Date().toISOString(),readiness:score,checks,modules,knownLimitations:['Keine automatische Amazon-KDP-Anmeldung oder Veröffentlichung','Keine automatische Währungsumrechnung','Cloud-Synchronisation und Mehrbenutzerbetrieb noch nicht produktiv','Empfehlungen und Prognosen sind regelbasiert und keine Erfolgsgarantie'],notes,browser:navigator.userAgent};const b=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='CH-FANDRICH-Studio-1.1-Releasebericht.json';a.click();URL.revokeObjectURL(a.href)};
 return <div><h2>CH.FANDRICH Studio 1.1</h2><p>Abschlussprüfung und Release-Bericht für Version 1.1.0.</p><div className="grid"><div className="card">Version<br/><b>1.1.0</b></div><div className="card">Release-Reife<br/><b>{score}%</b></div><div className="card">Module<br/><b>{modules.length}</b></div><div className="card">Status<br/><b>{score===100?'Freigabebereit':'Prüfung offen'}</b></div></div><h3>Enthaltene Module</h3><div className="grid">{modules.map(m=><div className="card" key={m}>✓ {m}</div>)}</div><h3>Release-Checkliste</h3>{checks.map(c=><label className="card" key={c.id} style={{display:'block'}}><input type="checkbox" checked={c.done} onChange={()=>toggle(c.id)}/> {c.label}</label>)}<h3>Release-Notizen</h3><textarea rows={6} value={notes} onChange={e=>{setNotes(e.target.value);localStorage.setItem('studio-release-1-1-notes',e.target.value)}} placeholder="Testergebnisse, bekannte Fehler oder Freigabehinweise"/><p><button onClick={exportReport}>Releasebericht exportieren</button></p><div className="card"><b>Bekannte Grenzen</b><p>Der tatsächliche KDP-Upload bleibt manuell. Währungen werden nicht automatisch umgerechnet. Cloud, echte Benutzerkonten und Teamarbeit benötigen weiterhin ein sicheres Backend. Prognosen sind Schätzungen und keine Erfolgsgarantie.</p></div></div>
}