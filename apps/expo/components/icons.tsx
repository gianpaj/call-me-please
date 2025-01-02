import { StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

export const FontAwesomeIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) => {
  return <FontAwesome size={28} style={styles.icon} {...props} />;
};

export const styles = StyleSheet.create({
  icon: {
    marginBottom: -3,
  },
});

export const IonicIcon = (props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) => {
  return <Ionicons size={28} style={styles.icon} {...props} />;
};
