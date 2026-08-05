import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import ExportStudio from './ExportStudio';

let mountedRoot: Root | null = null;
let mountedElement: Element | null = null;

function mountExportStudio() {
  const headings = Array.from(document.querySelectorAll('.content .panel h2'));
  const heading = headings.find(node => node.textContent?.trim() === 'PDF & Export');
  const panel = heading?.closest('.panel');

  if (!panel) {
    if (mountedRoot) {
      mountedRoot.unmount();
      mountedRoot = null;
      mountedElement = null;
    }
    return;
  }

  if (mountedElement === panel) return;
  mountedRoot?.unmount();
  panel.innerHTML = '<div id="react-export-studio-root"></div>';
  const target = panel.querySelector('#react-export-studio-root');
  if (!target) return;
  mountedRoot = createRoot(target);
  mountedRoot.render(<ExportStudio />);
  mountedElement = panel;
}

const observer = new MutationObserver(() => queueMicrotask(mountExportStudio));
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', mountExportStudio);
mountExportStudio();
