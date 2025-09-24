# Offline Support in Studyxo SHS

## How Offline Support Works

This app uses a Service Worker (`public/sw.js`) to enable offline functionality. The service worker caches all essential static resources (HTML, JS, CSS, and data files) during the initial load. When the user is offline, the app serves these cached files, allowing the app to function without an internet connection.

### Key Points

- **First Load:**  
  The app requires an internet connection the first time to cache all necessary files.

- **Subsequent Loads:**  
  After the first load, the app works offline by serving cached files.

- **Service Worker:**  
  The service worker handles caching, fetch requests, and updates. It also supports background sync and push notifications (if enabled).

- **Updating the App:**  
  Users need to go online again to receive updates or new content.

## Relevant Files

- `public/sw.js` — Service worker logic for caching and offline support.
- `manifest.json` and `site.webmanifest` — PWA configuration files.
- `index.html` — Should include a reference to the manifest and register the service worker.

## Limitations

- The app must be loaded online at least once.
- New updates require an internet connection to be downloaded.
- Payment processing or any real-time features require an active internet connection.

## Summary

Your app is a Progressive Web App (PWA) with offline support, thanks to the service worker. Users can access most features offline after the initial load.
