import React, { useMemo, useState } from 'react';
import './seriesPlanner.css';

type VolumeStatus = 'Idee' | 'In Arbeit' | 'Prüfung' | 'Uploadbereit';
type Volume = { id: number; series: string; number: number; title: string; type: string; status: VolumeStatus; progress: number };

type Project = { id: number; title: string; type: string; series: string; status: VolumeStatus; progress: number };
type Series = { id: number; name: string; volumes: number; active: number };

const starterVolumes: Volume[] = [
  { id: 1, series: 'Tierwelten', number: 1, title: 'Wintertiere', type: 'Malbuch', status: 'In Arbeit', progress: 72 },
  { id: 2, series: 'Tierwelten', number: 2, title: 'Babytiere', type: 'Malbuch', status: 'Idee', progress: 15 },
  { id: 3, series: 'Drachenwelten', number: 1, title: 'Freundliche Drachen', type: 'Malbuch', status: 'Prüfung', progress: 88 }
];

const statuses: VolumeStatus[] = ['Idee', 'In Arbeit', 'Prüfung', 'Uploadbereit'];

export default function SeriesPlanner() {
  const [volumes, setVolumes] = useState<Volume[]>(() => {
    try { return JSON.parse(localStorage.getItem('studio-series-volumes') || 'null') || starterVolumes; } catch { return starterVolumes; }
  });
  const [seriesName, setSeriesName] = useState('Tierwelten');
  const [title, setTitle] = useState('Neuer Band');
  const [type, setType] = useState('Malbuch');

  const save = (next: Volume[]) => {
    setVolumes(next);
    localStorage.setItem('studio-series-volumes', JSON.stringify(next));
  };

  const grouped = useMemo(() => Object.entries(volumes.reduce<Record<string, Volume[]>>((all, volume) => {
    (all[volume.series] ||= []).push(volume);
    return all;
  }, {})).sort(([a], [b]) => a.localeCompare(b)), [volumes]);

  const createVolume = () => {
    const cleanSeries = seriesName.trim();
    const cleanTitle = title.trim();
    if (!cleanSeries || !cleanTitle) return;
    const number = Math.max(0, ...volumes.filter(item => item.series === cleanSeries).map(item => item.number)) + 1;
    const volume: Volume = { id: Date.now(), series: cleanSeries, number, title: cleanTitle, type, status: 'Idee', progress: 0 };
    save([...volumes, volume]);

    const projects: Project[] = JSON.parse(localStorage.getItem('studio-projects') || '[]');
    projects.unshift({ id: volume.id, title: `${cleanSeries} – Band ${number}: ${cleanTitle}`, type, series: cleanSeries, status: 'Idee', progress: 0 });
    localStorage.setItem('studio-projects', JSON.stringify(projects));

    const series: Series[] = JSON.parse(localStorage.getItem('studio-series') || '[]');
    const existing = series.find(item => item.name === cleanSeries);
    if (existing) {
      existing.volumes = Math.max(existing.volumes, number);
      existing.active += 1;
    } else {
      series.unshift({ id: Date.now() + 1, name: cleanSeries, volumes: number, active: 1 });
    }
    localStorage.setItem('studio-series', JSON.stringify(series));
    setTitle('Neuer Band');
  };

  const updateVolume = (id: number, patch: Partial<Volume>) => save(volumes.map(volume => volume.id === id ? { ...volume, ...patch } : volume));
  const removeVolume = (id: number) => save(volumes.filter(volume => volume.id !== id));

  return <div className="series-planner">
    <div className="panel-head">
      <div><p className="eyebrow">SPRINT 14</p><h2>Serien- & Bandplaner</h2><p>Plane komplette Buchreihen und lege neue Bände direkt als Projekte an.</p></div>
      <span className="series-total">{volumes.length} Bände</span>
    </div>

    <section className="series-create-card">
      <label>Serienname<input value={seriesName} onChange={event => setSeriesName(event.target.value)} /></label>
      <label>Bandtitel<input value={title} onChange={event => setTitle(event.target.value)} /></label>
      <label>Buchart<select value={type} onChange={event => setType(event.target.value)}><option>Malbuch</option><option>Rätselbuch</option><option>Kinderbuch</option><option>Geschichtenbuch</option><option>Roman</option></select></label>
      <button onClick={createVolume}>Band als Projekt anlegen</button>
    </section>

    <div className="series-groups">
      {grouped.map(([name, items]) => <section className="series-group" key={name}>
        <header><div><h3>{name}</h3><p>{items.length} geplante Bände</p></div><strong>{Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length)} % Ø</strong></header>
        <div className="volume-list">{items.sort((a,b) => a.number - b.number).map(volume => <article className="volume-card" key={volume.id}>
          <span className="volume-number">{volume.number}</span>
          <div className="volume-main"><small>{volume.type}</small><strong>{volume.title}</strong><div className="volume-progress"><i style={{ width: `${volume.progress}%` }} /></div></div>
          <select value={volume.status} onChange={event => updateVolume(volume.id, { status: event.target.value as VolumeStatus })}>{statuses.map(status => <option key={status}>{status}</option>)}</select>
          <label className="progress-input"><input type="number" min="0" max="100" value={volume.progress} onChange={event => updateVolume(volume.id, { progress: Math.max(0, Math.min(100, Number(event.target.value))) })} /><span>%</span></label>
          <button className="volume-delete" onClick={() => removeVolume(volume.id)} aria-label="Band löschen">×</button>
        </article>)}</div>
      </section>)}
    </div>
  </div>;
}
