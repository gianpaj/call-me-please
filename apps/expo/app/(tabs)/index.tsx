import { Stack } from 'expo-router';
import {Text} from 'react-native'
import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

export default function CallNow() {
  return (
    <>
      <Stack.Screen options={{ title: 'Call Now' }} />
      <View style={styles.container}>
        <ScreenContent path="app/(tabs)/call-now.tsx" title="Call Now" />
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
