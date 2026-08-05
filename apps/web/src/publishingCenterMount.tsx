import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import PublishingCenter from './PublishingCenter';

let root:Root|null=null;
function ensureNavigation(){
  const nav=document.querySelector('.sidebar nav');
  if(!nav||nav.querySelector('[data-publishing-center]')) return;
  const button=document.createElement('button');button.textContent='Veröffentlichungscenter';button.dataset.publishingCenter='true';
  button.addEventListener('click',()=>{
    document.querySelectorAll('.sidebar nav button').forEach(item=>item.classList.remove('active'));button.classList.add('active');
    const title=document.querySelector('.content > .topbar h1');if(title) title.textContent='Veröffentlichungscenter';
    const content=document.querySelector('.content');if(!content)return;
    Array.from(content.children).forEach(child=>{if(!child.classList.contains('topbar')) child.remove()});
    const panel=document.createElement('section');panel.className='panel publishing-center-panel';content.appendChild(panel);
    root?.unmount();root=createRoot(panel);root.render(<PublishingCenter/>);
  });
  nav.appendChild(button);
}
new MutationObserver(()=>queueMicrotask(ensureNavigation)).observe(document.body,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',ensureNavigation);ensureNavigation();
