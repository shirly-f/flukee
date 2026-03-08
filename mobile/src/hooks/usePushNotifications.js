import { useEffect } from 'react';

/**
 * Push notifications: disabled for Expo Go (module version mismatch).
 * Email notifications still work. To enable push, add expo-notifications
 * via: npx expo install expo-notifications expo-device (requires dev build)
 */
export function usePushNotifications(user) {
  useEffect(() => {
    // No-op: push disabled until compatible with Expo 49
  }, [user?.id]);
}
