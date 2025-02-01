import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.churros',
  appName: 'Churros',
  webDir: 'build-static',
  android: {
    allowMixedContent: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      overlaysWebview: true,
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
    SafeArea: {
      enabled: true
    }
  },
};

export default config;
