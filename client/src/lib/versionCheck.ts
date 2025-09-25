// src/lib/versionCheck.ts
// Checks the service worker version and triggers a callback if it changes

export async function getServiceWorkerVersion(): Promise<string | null> {
  if ('serviceWorker' in navigator) {
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      return new Promise(resolve => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = event => {
          resolve(event.data?.version || null);
        };
        controller.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
      });
    }
  }
  return null;
}
