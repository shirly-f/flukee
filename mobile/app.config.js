const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// For physical device: set your computer's IP (e.g. '192.168.1.5')
// For production/deployed backend: full URL (e.g. 'https://flukee-backend.onrender.com')
// Leave both empty for simulator/emulator (uses localhost)
const API_HOST = process.env.FLUKEE_API_HOST || '';
const API_BASE_URL = process.env.FLUKEE_API_BASE_URL || '';

module.exports = {
  expo: {
    name: 'Flukee',
    extra: { apiHost: API_HOST, apiBaseUrl: API_BASE_URL },
    slug: 'flukee-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: path.resolve(__dirname, 'assets/icon.png'),
    userInterfaceStyle: 'light',
    splash: {
      image: path.resolve(__dirname, 'assets/splash.png'),
      resizeMode: 'contain',
      backgroundColor: '#F8F6F2',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.flukee.mobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: path.resolve(__dirname, 'assets/adaptive-icon.png'),
        backgroundColor: '#F8F6F2',
      },
      package: 'com.flukee.mobile',
    },
    web: {
      favicon: path.resolve(__dirname, 'assets/favicon.png'),
    },
  },
};
