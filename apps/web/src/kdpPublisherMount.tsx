import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import KdpPublisher from './KdpPublisher';

let root:Root|null=null;
function ensure(){
 const nav=document.querySelector('.sidebar nav');
 if(!nav||nav.querySelector('[data-kdp-publisher]'))return;
 const button=document.createElement('button');
 button.textContent='KDP Publisher';button.dataset.kdpPublisher='true';
 button.addEventListener('click',()=>{
  document.querySelectorAll('.sidebar nav button').forEach(x=>x.classList.remove('active'));button.classList.add('active');
  const title=document.querySelector('.content > .topbar h1');if(title)title.textContent='KDP Publisher';
  const content=document.querySelector('.content');if(!content)return;
  Array.from(content.children).forEach(child=>{if(!child.classList.contains('topbar'))child.remove()});
  const panel=document.createElement('section');panel.className='panel kdp-publisher-panel';content.appendChild(panel);
  root?.unmount();root=createRoot(panel);root.render(<KdpPublisher/>);
 });
 nav.appendChild(button);
}
new MutationObserver(()=>queueMicrotask(ensure)).observe(document.body,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',ensure);ensure();
