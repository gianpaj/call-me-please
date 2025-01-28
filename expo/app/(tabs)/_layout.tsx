// import "@bacons/text-decoder/install";

import { Text, View } from "react-native";
import { Link, Tabs } from "expo-router";
import { useEffect, useState } from "react";

import { HeaderButton } from "~/components/HeaderButton";
import { FontAwesomeIcon, IonicIcon } from "~/components/icons";
import { TRPCProvider } from "~/utils/api";
import { supabase } from "~/utils/supabase";
import { useSessionStore } from "~/store/store";

export default function TabLayout() {
  const { creditsLeft, sessionAccessToken, setSessionAccessToken } =
    useSessionStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log({ session });

      setSessionAccessToken(session?.access_token);
    });
    // then get credits left from API
    // then set setCretditsLeft in sessionStore

    supabase.auth.onAuthStateChange((_event, session) => {
      setSessionAccessToken(session?.access_token);
    });
  }, []);

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
                  Credits left: {creditsLeft}
                </Text>
                <Link href="/modal" asChild>
                  <HeaderButton />
                </Link>
              </View>
            ),
          }}
        />
        {/* <Tabs.Screen
          name="clone"
          options={{
            title: "Clone Voice",
            tabBarIcon: ({ color }) => (
              <IonicIcon name="recording-sharp" color={color} />
            ),
          }}
        /> */}
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
