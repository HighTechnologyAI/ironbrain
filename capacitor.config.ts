import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bcf8d96f52cc481e97c3f61f757e6891',
  appName: 'tel-crm-buddy',
  webDir: 'dist',
  server: {
    url: 'https://bcf8d96f-52cc-481e-97c3-f61f757e6891.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;