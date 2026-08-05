import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import ActivityGenerator from './ActivityGenerator';

let root:Root|null=null;
function ensureNavigation(){
  const nav=document.querySelector('.sidebar nav');
  if(!nav||nav.querySelector('[data-activity-generator]')) return;
  const button=document.createElement('button');
  button.textContent='Rätsel-Generator';button.dataset.activityGenerator='true';
  button.addEventListener('click',()=>{
    document.querySelectorAll('.sidebar nav button').forEach(item=>item.classList.remove('active'));button.classList.add('active');
    const title=document.querySelector('.content > .topbar h1');if(title) title.textContent='Rätsel-Generator';
    const content=document.querySelector('.content');if(!content)return;
    Array.from(content.children).forEach(child=>{if(!child.classList.contains('topbar')) child.remove()});
    const panel=document.createElement('section');panel.className='panel activity-generator-panel';content.appendChild(panel);
    root?.unmount();root=createRoot(panel);root.render(<ActivityGenerator/>);
  });
  nav.appendChild(button);
}
new MutationObserver(()=>queueMicrotask(ensureNavigation)).observe(document.body,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',ensureNavigation);ensureNavigation();
