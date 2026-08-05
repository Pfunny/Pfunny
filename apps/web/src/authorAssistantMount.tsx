import React from'react';
import{createRoot,Root}from'react-dom/client';
import AuthorAssistant from'./AuthorAssistant';
import'./authorAssistant.css';
let root:Root|null=null;
function ensureNavigation(){
 const nav=document.querySelector('.sidebar nav');
 if(!nav||nav.querySelector('[data-author-assistant]'))return;
 const button=document.createElement('button');button.textContent='KI-Autorenassistent';button.dataset.authorAssistant='true';
 button.addEventListener('click',()=>{
  document.querySelectorAll('.sidebar nav button').forEach(item=>item.classList.remove('active'));button.classList.add('active');
  const title=document.querySelector('.content > .topbar h1');if(title)title.textContent='KI-Autorenassistent';
  const content=document.querySelector('.content');if(!content)return;
  Array.from(content.children).forEach(child=>{if(!child.classList.contains('topbar'))child.remove()});
  const panel=document.createElement('section');panel.className='author-assistant-host';content.appendChild(panel);
  root?.unmount();root=createRoot(panel);root.render(<AuthorAssistant/>);
 });
 nav.appendChild(button);
}
new MutationObserver(()=>queueMicrotask(ensureNavigation)).observe(document.body,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',ensureNavigation);ensureNavigation();
