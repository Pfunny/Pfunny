import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import AITools from './AITools';
import './aiTools.css';

let root: Root | null = null;

function openAITools() {
  const content = document.querySelector('.content');
  const heading = content?.querySelector('.topbar h1');
  if (!content) return;
  if (heading) heading.textContent = 'KI-Werkzeuge';
  content.querySelectorAll(':scope > section, :scope > .editor-shell').forEach(node => node.remove());
  let panel = content.querySelector('.ai-tools-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'panel ai-tools-panel';
    content.appendChild(panel);
  }
  root?.unmount();
  root = createRoot(panel);
  root.render(<AITools />);
  document.querySelectorAll('.sidebar nav button').forEach(button => button.classList.toggle('active', button.textContent === 'KI-Werkzeuge'));
}

function installNavigation() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-ai-tools]')) return;
  const button = document.createElement('button');
  button.textContent = 'KI-Werkzeuge';
  button.setAttribute('data-ai-tools', 'true');
  button.addEventListener('click', openAITools);
  const settings = Array.from(nav.querySelectorAll('button')).find(item => item.textContent === 'Einstellungen');
  nav.insertBefore(button, settings || null);
}

new MutationObserver(() => installNavigation()).observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', installNavigation);
installNavigation();
