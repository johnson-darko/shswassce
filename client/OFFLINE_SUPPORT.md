# Offline Support in GH-UniCheck

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
Attention SHS graduates—your future is calling!

You’ve worked hard, you’ve conquered WASSCE, and now it’s time to take the next big leap.
Which programs do you qualify for? Do you know each program’s requirements—or do you have to visit over 50 university websites in Ghana just to figure them out?

Don’t leave your dreams to chance.

Introducing the SHS WASSCE University Guide—the smart, easy-to-use app built just for Ghana’s brightest graduates.
Instantly calculate your aggregate, discover every program you’re eligible for, and get all the data you need to make the best choice.

With this app, you can compare different programs side by side, save your favorites for later, and even explore job prospects for each program.

No more confusion. No more missed opportunities.
With the SHS WASSCE University Guide, you’re in control—anytime, anywhere, even offline.

Ready to unlock your future?
Download the SHS WASSCE University Guide today.
Your journey to university starts now!

GPT-4.1 • 0x