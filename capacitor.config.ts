import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2fac91ce61744be2b78bc1ea54eee24c',
  appName: 'kokoro-graph-network',
  webDir: 'dist',
  server: {
    url: "https://2fac91ce-6174-4be2-b78b-c1ea54eee24c.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;