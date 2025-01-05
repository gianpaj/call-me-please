import type {
  NotificationHandlingError,
  NotificationRequestInput,
} from "expo-notifications";
import {
  AndroidImportance,
  setNotificationHandler as ENsetNotificationHandler,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
} from "expo-notifications";

export const requestPermissions = () =>
  requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
    android: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

export const setNotificationHandler = async (
  onSuccess: ((notificationId: string) => void) | undefined,
  onError:
    | ((notificationId: string, error: NotificationHandlingError) => void)
    | undefined,
) => {
  ENsetNotificationHandler({
    // eslint-disable-next-line @typescript-eslint/require-await
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
    handleSuccess: onSuccess,
    handleError: onError,
  });

  // Prepare the notification channel - for Android 8.0+
  await setNotificationChannelAsync("new_alarm", {
    name: "WakeCall alarms",
    importance: AndroidImportance.HIGH,
    sound: "./assets/notification_sound.wav",
  });
};

export const scheduleNotification = ({
  content,
}: Pick<NotificationRequestInput, "content">) =>
  scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      // sound: "mySoundFile.wav",
    },
    trigger: {
      seconds: 3,
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: "new_alarm",
    },
  });
