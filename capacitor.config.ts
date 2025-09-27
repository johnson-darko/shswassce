import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyxo.shs',
  appName: 'GH-UniCheck',
  webDir: 'dist',
  server: {
    url: 'https://shs.studyxo.com/',
    cleartext: true
  }
};

export default config;
