import { Platform, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

import { ScreenContent } from "~/components/ScreenContent";

export default function Modal() {
  return (
    <>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      <ScreenContent title="Info">
        <Text>Modal content</Text>
      </ScreenContent>
    </>
  );
}
