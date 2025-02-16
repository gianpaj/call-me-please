import "../global.css";

import {
  // AudioSession,
  // LiveKitRoom,
  // useTracks,
  // TrackReferenceOrPlaceholder,
  // VideoTrack,
  // isTrackReference,
  registerGlobals,
  setLogLevel,
} from "@livekit/react-native";
import { Stack } from "expo-router";
import { LogLevel } from "livekit-client";

import { ConnectionProvider } from "~/hooks/use-connection";

// import { setupCallService } from '../services/callService/callService';

// setupErrorLogHandler();
setLogLevel(LogLevel.debug);

// Setup for CallService (keep alive in background) - TODO
// setupCallService();

registerGlobals();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <ConnectionProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ title: "Info", presentation: "modal" }}
        />
      </Stack>
    </ConnectionProvider>
  );
}
