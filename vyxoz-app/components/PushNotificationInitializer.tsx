import React, { useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

/**
 * Component that initializes push notifications when user is authenticated.
 * Must be placed inside AuthProvider.
 */
export function PushNotificationInitializer({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const { expoPushToken, notification, error } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log('🔔 Push notifications initialized with token:', expoPushToken);
    }
    if (error) {
      console.warn('⚠️ Push notification error:', error);
    }
  }, [expoPushToken, error]);

  useEffect(() => {
    if (notification) {
      console.log('📬 New notification:', notification.request.content.title);
    }
  }, [notification]);

  return <>{children}</>;
}

export default PushNotificationInitializer;
