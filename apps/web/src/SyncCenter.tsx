import React,{useMemo,useState} from 'react';

type Member={id:string;name:string;role:'Inhaber'|'Bearbeiter'|'Leser'};
type SyncPackage={version:1;createdAt:string;deviceId:string;checksum:string;data:Record<string,string|null>};
const KEYS=['studio-projects','studio-series','studio-book-pages','studio-media-library','studio-kdp-metadata','studio-cover-pro','studio-publishing-center','studio-snapshots'];
const DEVICE_KEY='studio-device-profile';
const TEAM_KEY='studio-team-members';
const LAST_SYNC_KEY='studio-last-sync';
const makeId=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const hash=(value:string)=>{let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)};

export default function SyncCenter(){
 const [profile,setProfile]=useState(()=>JSON.parse(localStorage.getItem(DEVICE_KEY)||'null')||{id:makeId(),name:'Mein Gerät'});
 const [members,setMembers]=useState<Member[]>(()=>JSON.parse(localStorage.getItem(TEAM_KEY)||'[]'));
 const [status,setStatus]=useState('Bereit');
 const [incoming,setIncoming]=useState<SyncPackage|null>(null);
 const [memberName,setMemberName]=useState('');
 const lastSync=localStorage.getItem(LAST_SYNC_KEY)||'Noch nicht synchronisiert';
 const localData=useMemo(()=>Object.fromEntries(KEYS.map(k=>[k,localStorage.getItem(k)])),[]);
 const localChecksum=hash(JSON.stringify(localData));
 const saveProfile=(name:string)=>{const next={...profile,name};setProfile(next);localStorage.setItem(DEVICE_KEY,JSON.stringify(next))};
 const exportPackage=()=>{const pkg:SyncPackage={version:1,createdAt:new Date().toISOString(),deviceId:profile.id,checksum:localChecksum,data:localData};const blob=new Blob([JSON.stringify(pkg,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`CH-FANDRICH-Sync-${Date.now()}.json`;a.click();URL.revokeObjectURL(a.href);localStorage.setItem(LAST_SYNC_KEY,new Date().toLocaleString('de-DE'));setStatus('Sync-Paket exportiert')};
 const inspect=async(file:File)=>{try{const pkg=JSON.parse(await file.text()) as SyncPackage;if(pkg.version!==1||!pkg.data)throw new Error();setIncoming(pkg);setStatus(pkg.checksum===localChecksum?'Keine Unterschiede erkannt':'Unterschiede erkannt – Import möglich')}catch{setIncoming(null);setStatus('Ungültiges Sync-Paket')}};
 const apply=()=>{if(!incoming)return;Object.entries(incoming.data).forEach(([k,v])=>v===null?localStorage.removeItem(k):localStorage.setItem(k,v));localStorage.setItem(LAST_SYNC_KEY,new Date().toLocaleString('de-DE'));setStatus('Paket übernommen – Seite neu laden');setIncoming(null)};
 const addMember=()=>{if(!memberName.trim())return;const next=[...members,{id:makeId(),name:memberName.trim(),role:'Bearbeiter' as const}];setMembers(next);localStorage.setItem(TEAM_KEY,JSON.stringify(next));setMemberName('')};
 const updateRole=(id:string,role:Member['role'])=>{const next=members.map(m=>m.id===id?{...m,role}:m);setMembers(next);localStorage.setItem(TEAM_KEY,JSON.stringify(next))};
 return <div className="sync-center">
  <div className="panel-head"><div><h2>Synchronisation & Team</h2><p>Lokale Grundlage für Gerätewechsel und spätere Cloud-Anbindung.</p></div><span className="badge">{status}</span></div>
  <div className="two-columns">
   <section className="panel"><h3>Geräteprofil</h3><label className="editor-field">Gerätename<input value={profile.name} onChange={e=>saveProfile(e.target.value)}/></label><p className="muted">Geräte-ID: {profile.id}</p><p className="muted">Letzter Austausch: {lastSync}</p><button onClick={exportPackage}>Sync-Paket exportieren</button></section>
   <section className="panel"><h3>Sync-Paket prüfen</h3><input type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&inspect(e.target.files[0])}/>{incoming&&<><p><strong>Quelle:</strong> {incoming.deviceId}</p><p><strong>Erstellt:</strong> {new Date(incoming.createdAt).toLocaleString('de-DE')}</p><p><strong>Konfliktstatus:</strong> {incoming.checksum===localChecksum?'identisch':'abweichend'}</p><button onClick={apply} disabled={incoming.checksum===localChecksum}>Geprüfte Daten übernehmen</button></>}</section>
  </div>
  <section className="panel"><h3>Teamrollen vorbereiten</h3><p className="muted">Die Rollen werden lokal verwaltet. Einladungen und gemeinsames Live-Arbeiten benötigen später Benutzerkonten und einen Server.</p><div className="actions"><input value={memberName} onChange={e=>setMemberName(e.target.value)} placeholder="Name eines Teammitglieds"/><button onClick={addMember}>Mitglied hinzufügen</button></div>{members.map(m=><div className="series-row" key={m.id}><strong>{m.name}</strong><select value={m.role} onChange={e=>updateRole(m.id,e.target.value as Member['role'])}><option>Inhaber</option><option>Bearbeiter</option><option>Leser</option></select></div>)}</section>
  <section className="panel"><h3>Cloud-Status</h3><p><strong>Noch nicht online verbunden.</strong> Dieses Modul liefert sichere Sync-Pakete, Konflikterkennung, Geräteidentität und Rollenmodelle. Für echte automatische Cloud-Synchronisation fehlt noch ein Backend mit Anmeldung, Datenbank und Verschlüsselung.</p></section>
 </div>
}
