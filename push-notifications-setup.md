# Local Notifications: Capacitor Mobile

## Overview
This guide explains how to add local notifications to your app for updates and reminders using Capacitor. It covers:
- Local notifications with Capacitor (no backend required)

---

## 1. Local Notifications (Capacitor)

- Use [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications) to schedule and display notifications directly on the device.
- No backend or external service required.
- Great for reminders, alerts, or scheduled messages.

### Example Usage
```js
import { LocalNotifications } from '@capacitor/local-notifications';

// Request permission
LocalNotifications.requestPermissions();

// Schedule a notification
LocalNotifications.schedule({
  notifications: [
    {
      title: 'Reminder',
      body: 'Check your eligibility today!',
      id: 1,
      schedule: { at: new Date(Date.now() + 60000) }, // 1 minute from now
    },
  ],
});
```
- Works offline and does not require push setup.
- You cannot send notifications from a server; only on the user's device.

---

## References
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)
