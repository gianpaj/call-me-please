import { StyleSheet, View } from "react-native";
import {
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
} from "expo-notifications";
import { Stack } from "expo-router";

import { Button } from "~/components/Button";

export default function Home() {
  const handleCancelAllWakeCalls = async () => {
    const notifications = await getAllScheduledNotificationsAsync();
    await cancelAllScheduledNotificationsAsync();
    if (notifications.length === 0) {
      alert("All WakeCalls have been cancelled");
      return;
    } else if (notifications.length > 0) {
      alert(`${notifications.length} WakeCalls have been cancelled`);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <View style={styles.container}>
        <Button
          onPress={handleCancelAllWakeCalls}
          title="Cancel all WakeCalls"
          className="w-50 mx-auto mt-4 py-2"
          variant="danger"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
