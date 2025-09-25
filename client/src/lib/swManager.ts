// src/lib/swManager.ts
// Handles service worker registration, update detection, and cache clearing

export function registerServiceWorker({ onUpdate }: { onUpdate: () => void }) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        // Listen for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  onUpdate();
                }
              }
            };
          }
        };
      });
    });
  }
}

export async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

export function hotReload() {
  window.location.reload();
}
