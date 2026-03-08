import { useEffect } from 'react';

/**
 * Notification tap handler - disabled (expo-notifications removed for Expo Go compatibility).
 * Email notifications still work from backend.
 */
export function useNotificationResponse(navigationRef) {
  useEffect(() => {
    // No-op: push notifications disabled
  }, []);
}
