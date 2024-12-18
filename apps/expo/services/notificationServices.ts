import * as Notifications from 'expo-notifications';
// import { Platform } from 'react-native';

export class NotificationService {
  static async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for notifications');
    }
  }

  static async scheduleAlarm(time: Date, title: string, body: string) {
    const trigger = new Date(time);

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger,
    });
  }

  static async cancelAlarm(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
