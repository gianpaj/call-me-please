import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import {
  AudioSession,
  isTrackReference,
  LiveKitRoom,
  registerGlobals,
  TrackReferenceOrPlaceholder,
  useTracks,
  VideoTrack,
} from "@livekit/react-native";

import { Button } from "~/components/Button";
import { useConnection } from "~/hooks/use-connection";

export default function CallNow() {
  const { shouldConnect, connect, disconnect, wsUrl, token } = useConnection();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  // // Start the audio session first.
  //  useEffect(() => {
  //    const start = async () => {
  //      await AudioSession.startAudioSession();
  //    };

  //    void start();
  //    return () => {
  //      void AudioSession.stopAudioSession();
  //    };
  //  }, []);

  const handleConnectionToggle = async () => {
    if (shouldConnect) {
      await disconnect();
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
          disabled={isConnecting || shouldConnect}
          title={shouldConnect ? "Disconnect" : "Call Me Now"}
          onPress={handleConnectionToggle}
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
