import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyxo.shs',
  appName: 'Studyxo SHS',
  webDir: 'dist',
  server: {
    url: 'https://shs.studyxo.com/',
    cleartext: true
  }
};

export default config;
