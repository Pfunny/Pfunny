import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import BookStudio from './BookStudio';

let root: Root | null = null;

function ensureBookStudioNavigation() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav || nav.querySelector('[data-book-studio]')) return;
  const button = document.createElement('button');
  button.textContent = 'KI-Buchstudio';
  button.dataset.bookStudio = 'true';
  button.addEventListener('click', () => {
    document.querySelectorAll('.sidebar nav button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const heading = document.querySelector('.content > .topbar h1');
    if (heading) heading.textContent = 'KI-Buchstudio';
    const content = document.querySelector('.content');
    if (!content) return;
    Array.from(content.children).forEach(child => { if (!child.classList.contains('topbar')) child.remove(); });
    const panel = document.createElement('section');
    panel.className = 'panel book-studio-panel';
    content.appendChild(panel);
    root?.unmount();
    root = createRoot(panel);
    root.render(<BookStudio />);
  });
  nav.appendChild(button);
}

new MutationObserver(() => queueMicrotask(ensureBookStudioNavigation)).observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', ensureBookStudioNavigation);
ensureBookStudioNavigation();
