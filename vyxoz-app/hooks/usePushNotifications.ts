import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../constants/api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();
  
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Register for push notifications
  async function registerForPushNotificationsAsync(): Promise<string | null> {
    let pushToken: string | null = null;

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('price-alerts', {
        name: 'Price Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      setError('Push notifications require a physical device');
      return null;
    }

    // Check and request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token: permission not granted');
      setError('Permission not granted for push notifications');
      return null;
    }

    // Get the Expo push token
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.warn('No projectId found in app config');
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      
      pushToken = tokenResponse.data;
      console.log('📲 Expo Push Token:', pushToken);
      setExpoPushToken(pushToken);
    } catch (err: any) {
      console.error('Error getting push token:', err);
      setError(err.message || 'Failed to get push token');
      return null;
    }

    return pushToken;
  }

  // Send push token to backend
  async function savePushTokenToBackend(pushToken: string, authToken: string) {
    console.log('📤 Attempting to save push token to backend...');
    console.log('   - Push token:', pushToken.substring(0, 30) + '...');
    console.log('   - Auth token present:', !!authToken);

    if (!authToken) {
      console.log('❌ No auth token, skipping push token save');
      return;
    }

    try {
      const url = getApiUrl('/api/users/push-token');
      console.log('   - URL:', url);
      
      const response = await axios.post(
        url,
        { expoPushToken: pushToken },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Push token saved to backend:', response.data);
    } catch (err: any) {
      console.error('❌ Failed to save push token to backend:', err.message);
      if (err.response) {
        console.error('   - Status:', err.response.status);
        console.error('   - Data:', err.response.data);
      }
    }
  }

  // Remove push token from backend (on logout)
  async function removePushTokenFromBackend() {
    if (!token) return;

    try {
      const url = getApiUrl('/api/users/push-token');
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Push token removed from backend');
    } catch (err: any) {
      console.error('Failed to remove push token from backend:', err.message);
    }
  }

  // Initialize push notifications
  useEffect(() => {
    console.log('🔄 usePushNotifications effect triggered');
    console.log('   - isAuthenticated:', isAuthenticated);
    console.log('   - token present:', !!token);
    
    if (!isAuthenticated || !token) {
      console.log('⏳ Waiting for authentication...');
      return;
    }

    console.log('🚀 Starting push notification registration...');
    
    // Register and save token
    registerForPushNotificationsAsync().then((pushToken) => {
      console.log('📱 Registration result:', pushToken ? 'SUCCESS' : 'FAILED');
      if (pushToken && token) {
        savePushTokenToBackend(pushToken, token);
      }
    }).catch(err => {
      console.error('❌ Registration error:', err);
    });

    // Listen for incoming notifications (when app is in foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification data
      if (data?.type === 'alert_triggered') {
        // Could navigate to tokens screen or show alert details
        console.log('Alert triggered notification tapped:', data);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, token]);

  return {
    expoPushToken,
    notification,
    error,
    registerForPushNotificationsAsync,
    savePushTokenToBackend,
    removePushTokenFromBackend,
  };
}

export default usePushNotifications;
