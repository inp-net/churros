import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.churros',
  appName: 'Churros',
  webDir: 'build',
  android: {
    allowMixedContent: true,
  },
};

export default config;
