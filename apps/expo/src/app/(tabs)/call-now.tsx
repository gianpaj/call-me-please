import { Stack } from 'expo-router';
import {Text} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

export default function CallNow() {
  return (
    // <>
    //   <Text>asdf</Text>
    // </>
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: 'Call Now' }} />
      <View style={styles.container}>
        <Text>asdf</Text>
        <ScreenContent path="app/(tabs)/call-now.tsx" title="Call Now" />
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
