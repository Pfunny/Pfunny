import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import VersionHistory from './VersionHistory';

let root: Root | null = null;
let panel: HTMLElement | null = null;

function ensureNavigation() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-version-history]')) return;

  const button = document.createElement('button');
  button.textContent = 'Versionsverlauf';
  button.dataset.versionHistory = 'true';
  button.addEventListener('click', () => {
    document.querySelectorAll('.sidebar nav button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const heading = document.querySelector('.content > .topbar h1');
    if (heading) heading.textContent = 'Versionsverlauf';
    const content = document.querySelector('.content');
    if (!content) return;
    Array.from(content.children).forEach(child => { if (!child.classList.contains('topbar')) child.remove(); });
    panel = document.createElement('section');
    panel.className = 'panel version-history-panel';
    content.appendChild(panel);
    root?.unmount();
    root = createRoot(panel);
    root.render(<VersionHistory />);
  });
  nav.appendChild(button);
}

new MutationObserver(() => queueMicrotask(ensureNavigation)).observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', ensureNavigation);
ensureNavigation();
