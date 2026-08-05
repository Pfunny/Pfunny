import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import SystemStatus from './SystemStatus';

let root: Root | null = null;

function ensureStyles() {
  if (document.getElementById('system-status-styles')) return;
  const style = document.createElement('style');
  style.id = 'system-status-styles';
  style.textContent = `.system-status-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.health{display:grid;place-items:center;min-width:82px;height:82px;border-radius:50%;font-size:1.35rem}.health.good{background:#dcfce7;color:#166534}.health.warn{background:#fef3c7;color:#92400e}.status-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:22px 0}.status-check{display:flex;gap:12px;padding:16px;border:1px solid #e2e8f0;border-radius:14px}.status-check>span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;font-weight:900}.status-check.ok>span{background:#dcfce7;color:#166534}.status-check.warn>span{background:#fef3c7;color:#92400e}.status-check p{margin:4px 0 0;color:#64748b}.status-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}@media(max-width:700px){.system-status-head{flex-direction:column}.status-grid{grid-template-columns:1fr}.health{min-width:70px;height:70px}}`;
  document.head.appendChild(style);
}

function addNavigation() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-system-status]')) return;
  const button = document.createElement('button');
  button.textContent = 'Systemstatus';
  button.dataset.systemStatus = 'true';
  button.addEventListener('click', () => {
    document.querySelectorAll('.sidebar nav button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const title = document.querySelector('.content > .topbar h1'); if (title) title.textContent = 'Systemstatus';
    const content = document.querySelector('.content'); if (!content) return;
    Array.from(content.children).forEach(child => { if (!child.classList.contains('topbar')) child.remove(); });
    const panel = document.createElement('section'); panel.className = 'panel'; content.appendChild(panel);
    root?.unmount(); root = createRoot(panel); root.render(<SystemStatus />);
  });
  nav.appendChild(button);
}

function init() { ensureStyles(); addNavigation(); }
new MutationObserver(() => queueMicrotask(init)).observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', init);
init();
