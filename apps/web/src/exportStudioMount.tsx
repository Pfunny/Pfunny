import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import ExportStudio from './ExportStudio';

let mountedRoot: Root | null = null;
let panel: HTMLElement | null = null;
let exportButton: HTMLButtonElement | null = null;

function closeExportView() {
  if (!panel) return;
  mountedRoot?.unmount();
  mountedRoot = null;
  panel.remove();
  panel = null;
  document.querySelectorAll<HTMLElement>('.content > :not(.topbar)').forEach(node => { node.style.display = ''; });
}

function openExportView() {
  const content = document.querySelector<HTMLElement>('.content');
  const title = document.querySelector<HTMLElement>('.topbar h1');
  if (!content) return;

  document.querySelectorAll<HTMLElement>('.content > :not(.topbar)').forEach(node => { node.style.display = 'none'; });
  document.querySelectorAll('.sidebar nav button').forEach(button => button.classList.remove('active'));
  exportButton?.classList.add('active');
  if (title) title.textContent = 'PDF & Export';

  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'panel export-host';
    panel.innerHTML = '<div id="react-export-studio-root"></div>';
    content.appendChild(panel);
    const target = panel.querySelector('#react-export-studio-root');
    if (target) {
      mountedRoot = createRoot(target);
      mountedRoot.render(<ExportStudio />);
    }
  }
}

function ensureNavigation() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-export-studio]')) return;
  exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.dataset.exportStudio = 'true';
  exportButton.textContent = 'PDF & Export';
  exportButton.addEventListener('click', openExportView);
  nav.appendChild(exportButton);

  nav.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-export-studio]')) return;
    if (target.closest('button')) closeExportView();
  });
}

const observer = new MutationObserver(() => queueMicrotask(ensureNavigation));
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', ensureNavigation);
ensureNavigation();
