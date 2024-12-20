import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
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

  return (
    <>
      <Stack.Screen options={{ title: "Call Now" }} />
      <View style={styles.container}>
        <LiveKitRoom
          serverUrl={wsUrl}
          token={token}
          connect={shouldConnect}
          options={{
            adaptiveStream: { pixelDensity: "screen" },
          }}
          audio={true}
        >
          {/* <RoomView /> */}
        </LiveKitRoom>
        <Button
          disabled={isConnecting}
          title={
            // Button text logic:
            // - If not connecting and should be connected: "Connected"
            // - If currently connecting or should be connected: "Connecting"
            // - Otherwise (default state): "Call Me Now"
            !isConnecting && shouldConnect
              ? "Connected"
              : isConnecting || shouldConnect
                ? "Connecting"
                : "Call Me Now"
          }
          onPress={handleConnectionToggle}
          className={
            isConnecting || shouldConnect ? "bg-indigo-400" : "bg-indigo-500"
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
});
