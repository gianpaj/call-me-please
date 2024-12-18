import { Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

import { Button } from '~/components/Button';

export default function CallNow() {
  return (
    <>
      <Stack.Screen options={{ title: 'Call Now' }} />
      <View style={styles.container}>
        <Button title="Call Me Now" onPress={() => console.log('Pressed')} />

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
