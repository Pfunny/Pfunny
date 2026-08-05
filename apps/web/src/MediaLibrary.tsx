import React, { useMemo, useState } from 'react';

type MediaItem = { id:string; name:string; type:string; size:number; dataUrl:string; category:string; tags:string[]; favorite:boolean; project:string; createdAt:string };
const KEY='chf-media-library';
const read=():MediaItem[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};

export default function MediaLibrary(){
  const [items,setItems]=useState<MediaItem[]>(read);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('Alle');
  const [favorites,setFavorites]=useState(false);
  const save=(next:MediaItem[])=>{setItems(next);localStorage.setItem(KEY,JSON.stringify(next))};
  const importFiles=async(files:FileList|null)=>{if(!files)return;const next=[...items];for(const file of Array.from(files)){if(!file.type.startsWith('image/'))continue;const dataUrl=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file)});next.unshift({id:crypto.randomUUID(),name:file.name,type:file.type,size:file.size,dataUrl,category:'Nicht sortiert',tags:[],favorite:false,project:'',createdAt:new Date().toISOString()})}save(next)};
  const filtered=useMemo(()=>items.filter(i=>(!query||`${i.name} ${i.tags.join(' ')} ${i.project}`.toLowerCase().includes(query.toLowerCase()))&&(category==='Alle'||i.category===category)&&(!favorites||i.favorite)),[items,query,category,favorites]);
  const patch=(id:string,data:Partial<MediaItem>)=>save(items.map(i=>i.id===id?{...i,...data}:i));
  const exportBackup=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),items},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='CH-FANDRICH-Medienbibliothek.json';a.click();URL.revokeObjectURL(a.href)};
  return <div className="media-library">
    <div className="panel-head"><div><p className="eyebrow">SPRINT 15</p><h2>Medienbibliothek</h2><p>Bilder, Logos, Cover und Illustrationen lokal verwalten.</p></div><label className="media-import">+ Bilder importieren<input type="file" accept="image/*" multiple onChange={e=>importFiles(e.target.files)}/></label></div>
    <div className="media-toolbar"><input placeholder="Suchen …" value={query} onChange={e=>setQuery(e.target.value)}/><select value={category} onChange={e=>setCategory(e.target.value)}><option>Alle</option><option>Cover</option><option>Innenseite</option><option>Logo</option><option>Autorenfoto</option><option>Nicht sortiert</option></select><button onClick={()=>setFavorites(!favorites)}>{favorites?'Alle anzeigen':'★ Favoriten'}</button><button onClick={exportBackup} disabled={!items.length}>Backup exportieren</button></div>
    <p className="muted">{filtered.length} von {items.length} Medien · Speicherung ausschließlich im Browser</p>
    <div className="media-grid">{filtered.map(item=><article className="media-card" key={item.id}><div className="media-preview"><img src={item.dataUrl} alt={item.name}/><button className="media-star" onClick={()=>patch(item.id,{favorite:!item.favorite})}>{item.favorite?'★':'☆'}</button></div><div className="media-details"><strong title={item.name}>{item.name}</strong><small>{item.type.replace('image/','').toUpperCase()} · {(item.size/1024/1024).toFixed(2)} MB</small><select value={item.category} onChange={e=>patch(item.id,{category:e.target.value})}><option>Cover</option><option>Innenseite</option><option>Logo</option><option>Autorenfoto</option><option>Nicht sortiert</option></select><input placeholder="Projekt oder Serie" value={item.project} onChange={e=>patch(item.id,{project:e.target.value})}/><input placeholder="Tags, durch Komma getrennt" value={item.tags.join(', ')} onChange={e=>patch(item.id,{tags:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})}/><button className="danger" onClick={()=>save(items.filter(i=>i.id!==item.id))}>Löschen</button></div></article>)}</div>
    {!filtered.length&&<div className="empty"><h3>Noch keine passenden Medien</h3><p>Importiere Bilder oder ändere Suche und Filter.</p></div>}
  </div>
}
