import { useEffect, useState } from "react";
import { Alert, Platform, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  NativeModuleError,
  statusCodes,
  User,
} from "@react-native-google-signin/google-signin";

import { ScreenContent } from "~/components/ScreenContent";

GoogleSignin.configure({
  scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: "", // specifies a hosted domain restriction
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: "", // [Android] specifies an account name on the device that should be used
  // iosClientId: "<FROM DEVELOPER CONSOLE>", // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: "", // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  openIdRealm: "", // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

export default function Modal() {
  const [userInfo, setUserInfo] = useState<User>();
  const [error, setError] = useState<Error>();
  // add logic to check if logged in
  //
  //

  useEffect(() => {
    const runOne = async () => {
      await _getCurrentUser();
    };
    void runOne();
  }, []);

  const _getCurrentUser = async () => {
    try {
      const { type, data } = await GoogleSignin.signInSilently();
      if (type === "success") {
        setUserInfo(data);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (type === "noSavedCredentialFound") {
        setError(new Error("User not signed in yet, please sign in :)"));
      }
    } catch (error) {
      const typedError = error as NativeModuleError;
      setError(typedError);
    }
  };
  const _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { type, data } = await GoogleSignin.signIn();
      if (type === "success") {
        console.log({ data });
        setUserInfo(data);
        // this.setState({ userInfo: data, error: undefined });
      } else {
        // sign in was cancelled by user
        setTimeout(() => {
          Alert.alert("cancelled");
        }, 500);
      }
    } catch (error) {
      if (!isErrorWithCode(error)) {
        alert(`an error that's not related to google sign in occurred`);
        return;
      }
      console.log("error", error.message);
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          Alert.alert(
            "in progress",
            "operation (eg. sign in) already in progress",
          );
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // android only
          Alert.alert("play services not available or outdated");
          break;
        default:
          Alert.alert("Something went wrong: ", JSON.stringify(error));
      }
      setError(error);
    }
  };

  return (
    <>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      <ScreenContent title="Info">
        <Text>Modal contents</Text>
        <GoogleSigninButton onPress={_signIn} />
        {userInfo && <Text>{JSON.stringify(userInfo)}</Text>}
        {error && <Text>{error.toString()}</Text>}
      </ScreenContent>
    </>
  );
}
