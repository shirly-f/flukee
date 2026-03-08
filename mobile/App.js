import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { useNotificationResponse } from './src/components/NotificationHandler';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme';
import { initI18n } from './src/i18n';

function AppContent() {
  const { user } = useAuth();
  const navigationRef = useRef(null);
  usePushNotifications(user);
  useNotificationResponse(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  // Don't block: show app when i18n + fonts load, or after error, or after 3s timeout
  const [showApp, setShowApp] = React.useState(false);
  React.useEffect(() => {
    if (i18nReady && (fontsLoaded || fontError)) setShowApp(true);
    const t = setTimeout(() => setShowApp(true), 3000);
    return () => clearTimeout(t);
  }, [i18nReady, fontsLoaded, fontError]);

  if (!showApp) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.cream }]}>
        <ActivityIndicator size="large" color={theme.colors.sage} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
