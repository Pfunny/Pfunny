import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import AITools from './AITools';

let root: Root | null = null;
let mounted: Element | null = null;

function mount() {
  const heading = Array.from(document.querySelectorAll('.content .panel h2')).find(node => node.textContent?.trim() === 'KI-Werkzeuge');
  const panel = heading?.closest('.panel');
  if (!panel) { root?.unmount(); root = null; mounted = null; return; }
  if (mounted === panel) return;
  root?.unmount();
  panel.innerHTML = '<div id="ai-tools-root"></div>';
  const target = panel.querySelector('#ai-tools-root');
  if (!target) return;
  root = createRoot(target);
  root.render(<AITools />);
  mounted = panel;
}

new MutationObserver(() => queueMicrotask(mount)).observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', mount);
mount();
