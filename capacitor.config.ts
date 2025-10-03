import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.100289ea3c34415fa645b7b29b76a548',
  appName: 'c2c',
  webDir: 'dist',
  server: {
    url: 'https://100289ea-3c34-415f-a645-b7b29b76a548.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BackgroundGeolocation: {
      backgroundMessage: 'Tracking your location for work hours',
      backgroundTitle: 'GPS Tracking Active',
      requestPermissions: true,
      stale: false,
      distanceFilter: 50
    }
  }
};

export default config;
