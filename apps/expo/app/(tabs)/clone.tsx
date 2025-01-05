import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";

import { Button } from "~/components/Button";

export default function Clone() {
  return (
    <>
      <Stack.Screen options={{ title: "Clone Voice" }} />
      <View style={styles.container}>
        <Button
          onPress={() => {}}
          title="Clone voice"
          className="w-50 mx-auto mt-4 py-2"
          variant="primary"
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
