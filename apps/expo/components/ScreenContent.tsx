import { Text, View } from "react-native";

interface ScreenContentProps {
  title: string;
  children?: React.ReactNode;
}

export const ScreenContent = ({ title, children }: ScreenContentProps) => {
  return (
    <View className={styles.container}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.separator} />
      {children}
    </View>
  );
};
const styles = {
  container: `items-center flex-1 justify-center`,
  separator: `h-[0.5px] my-7 w-4/5 bg-gray-400`,
  title: `text-xl font-bold`,
};
