import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyxo.shs',
  appName: 'Studyxo SHS',
  webDir: 'dist',
  server: {
    url: 'https://johnson-darko.github.io/shswassce/', // <-- This makes the app load your online site
    cleartext: true
  }
};

export default config;
