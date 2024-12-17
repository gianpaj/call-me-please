import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.container}>
        <ScreenContent path="app/(tabs)/settings.tsx" title="Settings" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
