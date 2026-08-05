import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import DataManager from './DataManager';

let root: Root | null = null;
let panel: HTMLElement | null = null;

function ensureNavigation() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-data-manager]')) return;
  const button = document.createElement('button');
  button.textContent = 'Daten & Backup';
  button.dataset.dataManager = 'true';
  button.addEventListener('click', () => {
    document.querySelectorAll('.sidebar nav button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelector('.content > .topbar h1')!.textContent = 'Daten & Backup';
    const content = document.querySelector('.content');
    if (!content) return;
    Array.from(content.children).forEach(child => { if (!child.classList.contains('topbar')) child.remove(); });
    panel = document.createElement('section');
    panel.className = 'panel data-manager-panel';
    content.appendChild(panel);
    root?.unmount();
    root = createRoot(panel);
    root.render(<DataManager />);
  });
  nav.appendChild(button);
}

new MutationObserver(() => queueMicrotask(ensureNavigation)).observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', ensureNavigation);
ensureNavigation();
