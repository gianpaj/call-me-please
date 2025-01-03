import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import { AudioSession, LiveKitRoom } from "@livekit/react-native";

import { Button } from "~/components/Button";
import VoicesDropdown from "~/components/VoicesDropdown";
import { VoiceId } from "~/data/voices";
import { useConnection } from "~/hooks/use-connection";
import { useSessionStore } from "~/store/store";
import {
  requestPermissions,
  scheduleNotification,
  setNotificationHandler,
} from "~/utils/permissions";

// OpenAI voices - TODO: get list of users' voices from API
const voices = Object.values(VoiceId).map((voice) => ({
  label: voice,
  value: voice,
}));

export default function Call() {
  const { shouldConnect, connect, disconnect, wsUrl, token } = useConnection();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [currentVoice, setVoice] = useState(VoiceId.ash);

  const playVoice = useCallback((voiceId: VoiceId) => {
    alert(`${voiceId} play`);
  }, []);

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
      await requestPermissions();
    } catch (error) {
      // TO TEST: on a newly installed app, deny permissions
      console.error("Error requesting permissions", error);
      alert("Error requesting permissions. Please try again.");
      return;
    }
    // First, set the handler that will cause the notification
    // to show the alert
    void setNotificationHandler(
      (notificationId: string) =>
        console.log("Notification handler set", notificationId),
      (error) => console.error("Error setting notification handler", error),
    );
    const notification_title = "Good morning";

    await scheduleNotification({
      content: {
        title: notification_title,
        body: "I'm proud of you. Now, let's get up and get going!",
      },
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
      <Stack.Screen options={{ title: "Call" }} />
      <ScrollView
        contentContainerClassName="flex-1 p-7 justify-center"
        keyboardDismissMode="on-drag"
      >
        <View className="py-4">
          <VoicesDropdown
            voices={voices}
            currentVoice={currentVoice}
            setVoice={setVoice}
            playVoice={playVoice}
          />
        </View>
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
          className="text-lg"
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
