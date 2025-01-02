// import "@bacons/text-decoder/install";

import { Link, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { HeaderButton } from "~/components/HeaderButton";
import { FontAwesomeIcon, IonicIcon } from "~/components/icons";
import { TRPCProvider } from "~/utils/api";

export default function TabLayout() {
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
              <Link href="/modal" asChild>
                <HeaderButton onPress={() => alert("yo")} />
              </Link>
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
