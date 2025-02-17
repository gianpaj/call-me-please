import { useMultibandTrackVolume } from "@livekit/components-react";
import { AudioSession, LiveKitRoom } from "@livekit/react-native";
import { Stack, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Portal } from "@rn-primitives/portal";
import type { MediaDeviceFailure } from "livekit-client";
import { AudioVisualizer } from "~/components/AudioVisualizer";
import { Button } from "~/components/Button";
import { CallInfo } from "~/components/CallInfo";
import VoicesDropdown from "~/components/VoicesDropdown";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "~/components/ui/toast";
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
  const {
    shouldConnect,
    connect,
    disconnect,
    wsUrl,
    token,
    setVoice,
    voice: currentVoice,
  } = useConnection();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const { creditsLeft, decreaseCreditsLeft } = useSessionStore();

  const playVoice = useCallback((voiceId: VoiceId) => {
    alert(`${voiceId} play`);
  }, []);

  // Start the audio session first.
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
      // if (creditsLeft <= 0) {
      //   alert("You're out of credits!");
      //   return;
      // }
      setIsConnecting(true);

      try {
        await connect();
        decreaseCreditsLeft();
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

  const onDeviceFailure = (e?: MediaDeviceFailure) => {
    console.error(e);
    // alert(
    //   'Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab',
    // );
  };

  const insets = useSafeAreaInsets();

  const [openToast, setOpenToast] = useState(false);

  return (
    <>
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
        <LiveKitRoom
          serverUrl={wsUrl}
          token={token}
          connect={shouldConnect}
          options={
            {
              // adaptiveStream: { pixelDensity: "screen" },
              // publishDefaults: {
              //   stopMicTrackOnMute: true,
              // },
            }
          }
          onMediaDeviceFailure={onDeviceFailure}
          audio={true}
        >
          <CallInfo />
          <AudioVisualizer />
        </LiveKitRoom>
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
      <Portal name="toast-example">
        <View style={{ top: insets.top + 4 }} className="px-4 absolute w-full">
          <Toast
            type="foreground"
            open={openToast}
            variant="destructive"
            onOpenChange={setOpenToast}
          >
            <View className="gap-1.5">
              <ToastTitle variant="destructive">Here is a toast</ToastTitle>
              <ToastDescription variant="destructive">
                It will disappear in {"x"} seconds
              </ToastDescription>
            </View>
            <View className="gap-2">
              <ToastAction variant="destructive" text="Ok" />
              {/* <ToastClose variant="destructive" /> */}
            </View>
          </Toast>
        </View>
      </Portal>
    </>
  );
}
