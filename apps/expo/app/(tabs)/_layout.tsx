// import "@bacons/text-decoder/install";

import { Text, View } from "react-native";
import { Link, Tabs } from "expo-router";

// import { StatusBar } from "expo-status-bar";

import { HeaderButton } from "~/components/HeaderButton";
import { FontAwesomeIcon, IonicIcon } from "~/components/icons";
import { TRPCProvider } from "~/utils/api";

export default function TabLayout() {
  const creditsLeft = 5;
  return (
    <TRPCProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "black",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Call",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon name="phone" color={color} />
            ),
            headerRight: () => (
              <View className="flex flex-row items-center">
                <Text className="mr-2 text-sm text-gray-700 dark:text-gray-400">
                  Credits:{creditsLeft}
                </Text>
                <Link href="/modal" asChild>
                  <HeaderButton />
                </Link>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="clone"
          options={{
            title: "Clone Voice",
            tabBarIcon: ({ color }) => (
              <IonicIcon name="recording-sharp" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon name="cog" color={color} />
            ),
          }}
        />
      </Tabs>
      {/* <StatusBar /> */}
    </TRPCProvider>
  );
}
