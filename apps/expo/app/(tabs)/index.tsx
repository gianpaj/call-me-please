import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput } from "react-native";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Stack } from "expo-router";
import { AudioSession, LiveKitRoom } from "@livekit/react-native";

import { Button } from "~/components/Button";
import { useConnection } from "~/hooks/use-connection";
import { useSessionStore } from "~/store/store";

export default function CallNow() {
  const { shouldConnect, connect, disconnect, wsUrl, token } = useConnection();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  // // Start the audio session first.
  useEffect(() => {
    const start = async () => {
      await AudioSession.startAudioSession();
    };

    void start();
    return () => {
      void AudioSession.stopAudioSession();
    };
  }, []);

  const handleConnectionToggle = async () => {
    if (shouldConnect) {
      disconnect();
    } else {
      setIsConnecting(true);

      try {
        await connect();
      } catch (error) {
        console.error("Connection failed:", error);
      } finally {
        setIsConnecting(false);
      }
    }
  };
  const { instructions, setInstructions } = useSessionStore();

  const handleScheduleCall = async () => {
    try {
      await Notifications.requestPermissionsAsync({
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
    } catch (error) {
      // TO TEST: on a newly installed app, deny permissions
      console.error("Error requesting permissions", error);
      alert("Error requesting permissions. Please try again.");
      return;
    }
    // First, set the handler that will cause the notification
    // to show the alert
    Notifications.setNotificationHandler({
      // eslint-disable-next-line @typescript-eslint/require-await
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
      handleSuccess: (notificationI) =>
        console.log("Notification handler set", notificationI),
      handleError: (error) =>
        console.error("Error setting notification handler", error),
    });

    // Prepare the notification channel - for Android 8.0+
    await Notifications.setNotificationChannelAsync("new_alarm", {
      name: "WakeCall alarms",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "./assets/notification_sound.wav",
    });

    const notification_title = "Good morning";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification_title,
        body: "I'm proud of you. Now, let's get up and get going!",
        // sound: "mySoundFile.wav",
      },
      trigger: {
        seconds: 3,
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        channelId: "new_alarm",
      },
      // trigger: { seconds: 60, type: SchedulableTriggerInputTypes.TIME_INTERVAL },
    });
  };

  return (
    <>
      <LiveKitRoom
        serverUrl={wsUrl}
        token={token}
        connect={shouldConnect}
        options={{
          adaptiveStream: { pixelDensity: "screen" },
          // publishDefaults: {
          //   stopMicTrackOnMute: true,
          // },
        }}
        audio={true}
      />
      <Stack.Screen options={{ title: "Call Now" }} />
      <ScrollView
        contentContainerClassName="flex-1 p-7 justify-center"
        keyboardDismissMode="on-drag"
      >
        <Button
          disabled={isConnecting}
          title={
            // Button text logic:
            // - If not connecting and should be connected: "Disconnect"
            // - If currently connecting or should be connected: "Connecting"
            // - Otherwise (default state): "Call Me Now"
            !isConnecting && shouldConnect
              ? "Disconnect"
              : isConnecting || shouldConnect
                ? "Connecting"
                : "Call Me Now"
          }
          onPress={handleConnectionToggle}
          variant="primary"
          className={isConnecting || shouldConnect ? "bg-indigo-400" : ""}
        />
        <Text className="mt-4 text-lg font-bold">Instructions:</Text>
        <TextInput
          editable={!(isConnecting || shouldConnect)}
          multiline
          onChangeText={(text) => setInstructions(text)}
        >
          {instructions}
        </TextInput>
        <Button
          title="Schedule WakeCall"
          onPress={handleScheduleCall}
          style={{ width: "60%" }}
          className="mx-auto mt-4 p-2"
          variant="secondary"
        />
      </ScrollView>
    </>
  );
}
