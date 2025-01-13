import { StyleSheet, View } from "react-native";
import {
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
} from "expo-notifications";
import { Stack } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// import Auth from "~/components/Auth";
import { Button } from "~/components/Button";

// import { supabase } from "~/utils/supabase";

export default function Settings() {
  const handleCancelAllWakeCalls = async () => {
    const notifications = await getAllScheduledNotificationsAsync();
    await cancelAllScheduledNotificationsAsync();
    if (notifications.length === 0) {
      alert("All WakeCalls have been cancelled");
      return;
    }
    if (notifications.length > 0) {
      alert(`${notifications.length} WakeCalls have been cancelled`);
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      // this.setState({ userInfo: undefined, error: undefined });
    } catch (error) {
      // this.setState({
      //   error: error as NativeModuleError,
      // });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <View style={styles.container}>
        {/* <Auth /> */}
        <Button
          onPress={handleCancelAllWakeCalls}
          title="Cancel all WakeCalls"
          className="w-50 mx-auto mt-4 py-2"
          variant="danger"
        />
        {/* {isLoggedIn &&} */}
        <Button
          onPress={signOut}
          title="Sign Out"
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
