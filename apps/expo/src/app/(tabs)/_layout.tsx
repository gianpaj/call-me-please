// import "@bacons/text-decoder/install";

import { Link, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { HeaderButton } from '~/components/HeaderButton';
import { TabBarIcon } from '~/components/TabBarIcon';

import { TRPCProvider } from '~/utils/api';

export default function TabLayout() {
  return (
    <TRPCProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'black',
        }}>
        <Tabs.Screen
          name="call-now"
          options={{
            title: 'Call Now',
            tabBarIcon: ({ color }) => <TabBarIcon name="phone" color={color} />,
            headerRight: () => (
              <Link href="/modal" asChild>
                <HeaderButton onPress={() => alert('yo')} />
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          }}
        />
      </Tabs>
      {/* <StatusBar /> */}
    </TRPCProvider>
  );
}
