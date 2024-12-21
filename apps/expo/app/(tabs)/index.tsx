import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput } from "react-native";
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
          className={
            isConnecting || shouldConnect ? "bg-indigo-400" : "bg-indigo-500"
          }
        />
        <Text className="mt-4 text-lg font-bold">Instructions:</Text>
        <TextInput
          editable={!(isConnecting || shouldConnect)}
          multiline
          onChangeText={(text) => setInstructions(text)}
        >
          {instructions}
        </TextInput>
      </ScrollView>
    </>
  );
}
