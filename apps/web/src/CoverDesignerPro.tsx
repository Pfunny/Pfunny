import React, { useMemo, useState } from 'react';

type FormatKey = '8.5x11' | '8.5x8.5' | '8x10' | '6x9';
const formats: Record<FormatKey, {w:number;h:number}> = {
  '8.5x11': { w: 8.5, h: 11 }, '8.5x8.5': { w: 8.5, h: 8.5 }, '8x10': { w: 8, h: 10 }, '6x9': { w: 6, h: 9 }
};
const paperFactor = { white: 0.002252, cream: 0.0025, color: 0.002347 };

export default function CoverDesignerPro(){
  const [format,setFormat]=useState<FormatKey>('8.5x11');
  const [pages,setPages]=useState(146);
  const [paper,setPaper]=useState<keyof typeof paperFactor>('white');
  const [bleed,setBleed]=useState(true);
  const [title,setTitle]=useState('Mein Buchtitel');
  const [subtitle,setSubtitle]=useState('Untertitel für Amazon KDP');
  const [author,setAuthor]=useState('Christopher Fandrich');
  const [backText,setBackText]=useState('Hier steht der Klappentext. Der Barcodebereich unten rechts bleibt frei.');
  const [accent,setAccent]=useState('#c89b3c');
  const size=formats[format];
  const spine=useMemo(()=>Math.max(0,pages)*paperFactor[paper],[pages,paper]);
  const bleedAdd=bleed?0.25:0;
  const totalW=size.w*2+spine+bleedAdd;
  const totalH=size.h+bleedAdd;
  const pxW=Math.round(totalW*300), pxH=Math.round(totalH*300);
  const report={format,pages,paper,bleed,trim:size,spineIn:spine,totalIn:{width:totalW,height:totalH},pixels:{width:pxW,height:pxH},barcodeFreeArea:'2 × 1.2 inch, bottom-right of back cover',safeMarginIn:0.25,title,subtitle,author,backText,accent};
  const save=()=>{localStorage.setItem('chf-cover-designer-pro',JSON.stringify(report));alert('Coverdaten lokal gespeichert.');};
  const exportJson=()=>{const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='KDP-Coverdaten.json';a.click();URL.revokeObjectURL(a.href);};
  return <div style={{display:'grid',gap:18}}>
    <div><p className="eyebrow">SPRINT 17</p><h2>KDP-Cover-Designer Pro</h2><p className="muted">Berechnet Umschlagmaß, Rückenbreite, Beschnitt, Sicherheitszonen und 300-dpi-Pixelmaße.</p></div>
    <div style={{display:'grid',gridTemplateColumns:'minmax(280px,420px) 1fr',gap:18}}>
      <section style={{display:'grid',gap:12}}>
        <label className="editor-field">Buchformat<select value={format} onChange={e=>setFormat(e.target.value as FormatKey)}><option value="8.5x11">8,5 × 11 Zoll</option><option value="8.5x8.5">8,5 × 8,5 Zoll</option><option value="8x10">8 × 10 Zoll</option><option value="6x9">6 × 9 Zoll</option></select></label>
        <label className="editor-field">Seitenzahl<input type="number" min="24" value={pages} onChange={e=>setPages(Number(e.target.value))}/></label>
        <label className="editor-field">Papier<select value={paper} onChange={e=>setPaper(e.target.value as keyof typeof paperFactor)}><option value="white">Weiß</option><option value="cream">Creme</option><option value="color">Farbe</option></select></label>
        <label className="check"><input type="checkbox" checked={bleed} onChange={e=>setBleed(e.target.checked)}/> Mit Beschnitt</label>
        <label className="editor-field">Titel<input value={title} onChange={e=>setTitle(e.target.value)}/></label>
        <label className="editor-field">Untertitel<input value={subtitle} onChange={e=>setSubtitle(e.target.value)}/></label>
        <label className="editor-field">Autor<input value={author} onChange={e=>setAuthor(e.target.value)}/></label>
        <label className="editor-field">Klappentext<textarea rows={5} value={backText} onChange={e=>setBackText(e.target.value)}/></label>
        <label className="editor-field">Akzentfarbe<input type="color" value={accent} onChange={e=>setAccent(e.target.value)}/></label>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button onClick={save}>Lokal speichern</button><button onClick={exportJson}>Coverdaten exportieren</button></div>
      </section>
      <section style={{display:'grid',gap:14}}>
        <div className="stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}><article className="stat"><span>Rücken</span><strong>{spine.toFixed(3)}″</strong></article><article className="stat"><span>Gesamtmaß</span><strong style={{fontSize:'1.1rem'}}>{totalW.toFixed(3)} × {totalH.toFixed(3)}″</strong></article><article className="stat"><span>300 dpi</span><strong style={{fontSize:'1.1rem'}}>{pxW} × {pxH}px</strong></article></div>
        <div style={{background:'#e5e7eb',padding:12,borderRadius:18,overflow:'auto'}}>
          <div style={{minWidth:720,aspectRatio:`${totalW}/${totalH}`,display:'grid',gridTemplateColumns:`1fr ${Math.max(18,spine/size.w*320)}px 1fr`,background:'#fff',boxShadow:'0 14px 30px rgba(15,23,42,.18)',border:`10px solid ${bleed?'#fca5a5':'transparent'}`}}>
            <div style={{position:'relative',padding:'7%',borderRight:'1px dashed #94a3b8'}}><h3>Rückseite</h3><p>{backText}</p><div style={{position:'absolute',right:'5%',bottom:'5%',width:'28%',height:'18%',border:'2px dashed #111827',background:'#fff',display:'grid',placeItems:'center',fontSize:12}}>Barcode frei</div></div>
            <div style={{background:'#111827',color:'#fff',writingMode:'vertical-rl',transform:'rotate(180deg)',display:'grid',placeItems:'center',fontWeight:800,fontSize:12,padding:4}}>{title}</div>
            <div style={{padding:'8%',display:'flex',flexDirection:'column',justifyContent:'space-between',textAlign:'center',outline:'2px dashed #94a3b8',outlineOffset:-18}}><div><small style={{color:accent,fontWeight:900}}>CH.FANDRICH®</small><h1 style={{fontSize:'clamp(28px,4vw,54px)',margin:'12px 0'}}>{title}</h1><h3 style={{fontWeight:500}}>{subtitle}</h3></div><strong>{author}</strong></div>
          </div>
        </div>
        <p className="muted">Die Vorschau zeigt Rückseite, Rücken und Vorderseite. Rot markiert den Beschnitt; gestrichelte Linien zeigen Sicherheits- und Barcodebereiche.</p>
      </section>
    </div>
  </div>;
}
