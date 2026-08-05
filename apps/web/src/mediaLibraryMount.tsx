import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import MediaLibrary from './MediaLibrary';
import './mediaLibrary.css';

let root:Root|null=null;
function ensure(){
  const nav=document.querySelector('.sidebar nav');
  if(!nav||nav.querySelector('[data-media-library]'))return;
  const button=document.createElement('button');
  button.textContent='Medienbibliothek';
  button.dataset.mediaLibrary='true';
  button.addEventListener('click',()=>{
    document.querySelectorAll('.sidebar nav button').forEach(item=>item.classList.remove('active'));
    button.classList.add('active');
    const title=document.querySelector('.content > .topbar h1');if(title)title.textContent='Medienbibliothek';
    const content=document.querySelector('.content');if(!content)return;
    Array.from(content.children).forEach(child=>{if(!child.classList.contains('topbar'))child.remove()});
    const panel=document.createElement('section');panel.className='panel media-library-panel';content.appendChild(panel);
    root?.unmount();root=createRoot(panel);root.render(<MediaLibrary/>);
  });
  nav.appendChild(button);
}
new MutationObserver(()=>queueMicrotask(ensure)).observe(document.body,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',ensure);ensure();
