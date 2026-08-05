export function registerPwa() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.error('Service Worker konnte nicht registriert werden:', error);
    });
  });
}

registerPwa();
