# Supabase Auth: Magic Link & 6-Digit Code Sign-In with Local Storage

## Overview
This guide explains how to use Supabase Auth for passwordless authentication (magic link or 6-digit code) and how to implement a "remember me" feature using local storage in your app. This approach works for web, PWA, and mobile apps (Capacitor). but then it will save the user email in superbase for me because in my other app i will need it as well.

## Steps

### 1. Set Up Supabase Project
- Go to [supabase.com](https://supabase.com) and create a free account.
- Create a new project.
- Get your Supabase URL and public API key from the project settings.

### 2. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 3. Initialize Supabase in Your App
```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');
```

### 4. Magic Link or 6-Digit Code Sign-In
```js
// Magic link
await supabase.auth.signInWithOtp({ email: userEmail });
// 6-digit code
await supabase.auth.verifyOtp({ email: userEmail, token: code, type: 'magiclink' });
```

### 5. Store Session in Local Storage
Supabase automatically persists the session in local storage. On app load, check for an existing session:
```js
const session = supabase.auth.getSession();
if (session) {
  // User is remembered, auto-login
} else {
  // Prompt for authentication
}
```

### 6. Log Out & Remove Session
```js
await supabase.auth.signOut();
// This removes session from local storage
```

### 7. "Remember Me" Logic
- As long as the session exists in local storage, the user stays logged in.
- If the user deletes the app or clears storage, they must authenticate again.

## Notes
- Supabase free tier is suitable for most personal and student projects.
- No backend code required; all logic is in your frontend.
- Works with Capacitor for iOS/Android.

## References
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/auth-signinwithotp)





Share Feature:
Enable users to share the app or content via social media.
App Version Display:
Show the current app version in settings
check for update will refresh the app or check for updates from store
Feedback Form:
Allow users to send feedback or report issues.
Help/FAQ Section:
Add a help page or FAQ for user support.

these all would be dont in the settings page

