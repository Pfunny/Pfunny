import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import HelpCenter from './HelpCenter';

let root: Root | null = null;

function ensureHelpCenter() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-help-center]')) return;
  const button = document.createElement('button');
  button.textContent = 'Hilfe & Start';
  button.dataset.helpCenter = 'true';
  button.addEventListener('click', () => {
    document.querySelectorAll('.sidebar nav button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const title = document.querySelector('.content > .topbar h1');
    if (title) title.textContent = 'Hilfe & Start';
    const content = document.querySelector('.content');
    if (!content) return;
    Array.from(content.children).forEach(child => { if (!child.classList.contains('topbar')) child.remove(); });
    const panel = document.createElement('section');
    panel.className = 'panel';
    content.appendChild(panel);
    root?.unmount();
    root = createRoot(panel);
    root.render(<HelpCenter />);
  });
  nav.appendChild(button);
}

new MutationObserver(() => queueMicrotask(ensureHelpCenter)).observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', ensureHelpCenter);
ensureHelpCenter();
