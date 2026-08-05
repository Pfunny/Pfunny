import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import CoverStudio from './CoverStudio';

let mountedRoot: Root | null = null;
let mountedElement: Element | null = null;

function mountCoverStudio() {
  if (mountedElement && document.body.contains(mountedElement)) return;

  if (mountedRoot) {
    mountedRoot.unmount();
    mountedRoot = null;
    mountedElement = null;
  }

  const headings = Array.from(document.querySelectorAll('.content .panel h2'));
  const heading = headings.find(node => node.textContent?.trim() === 'Cover-Studio');
  const panel = heading?.closest('.panel');
  if (!panel) return;

  panel.innerHTML = '<div id="react-cover-studio-root"></div>';
  const target = panel.querySelector('#react-cover-studio-root');
  if (!target) return;

  mountedRoot = createRoot(target);
  mountedRoot.render(<CoverStudio />);
  mountedElement = panel;
}

const observer = new MutationObserver(() => queueMicrotask(mountCoverStudio));
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', mountCoverStudio);
mountCoverStudio();
