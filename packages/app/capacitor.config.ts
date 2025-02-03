import type { CapacitorConfig } from '@capacitor/cli';

const capacitorDevserverUrl = process.env['PUBLIC_REMOTE_DEVSERVER'];

if (capacitorDevserverUrl) {
  console.log('Using remote devserver:', capacitorDevserverUrl);
}

const config: CapacitorConfig = {
  appId: 'app.churros',
  appName: 'Churros',
  webDir: 'build-static',
  android: {
    allowMixedContent: true,
  },
  server: capacitorDevserverUrl
    ? {
        cleartext: capacitorDevserverUrl.startsWith('http://'),
        url: capacitorDevserverUrl,
      }
    : undefined,
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
      enabled: true,
    },
    CapacitorUpdater: {
      updateUrl: 'https://churros.inpt.fr/update-bundle',
    },
  },
};

export default config;
