import React, { useState } from "react";
import { Alert, StyleSheet, View, AppState, Button } from "react-native";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "utils/supabase";
import { useSessionStore } from "~/store/store";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { sessionAccessToken } = useSessionStore();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: "gianpa@gmail.com",
      password: "password",
    });

    if (error) Alert.alert(error.message);

    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: "gianpa@gmail.com",
      password: "password",
    });

    if (error) Alert.alert(error.message);
    if (!session) {
      Alert.alert("Please check your inbox for email verification!");
    }
    setLoading(false);
  }
  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;
    if (!access_token) return;
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data.session;
  };

  const performOAuth = async () => {
    const redirectTo = makeRedirectUri();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    console.log({ data });

    const res = await WebBrowser.openAuthSessionAsync(
      data?.url ?? "",
      redirectTo,
    );

    if (res.type === "success") {
      const { url } = res;
      await createSessionFromUrl(url);
      return;
    }
    if ("error" in res) {
      console.error(res);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        {/* <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        /> */}
      </View>
      <View style={styles.verticallySpaced}>
        {/* <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        /> */}
      </View>
      {sessionAccessToken ? (
        <>
          <Button
            title="Sign out"
            disabled={loading}
            onPress={() => supabase.auth.signOut()}
          />
        </>
      ) : (
        <>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              title="Sign in with Google"
              disabled={loading}
              onPress={performOAuth}
              // onPress={signInWithEmail}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              title="Sign up"
              disabled={loading}
              onPress={() => signUpWithEmail()}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
