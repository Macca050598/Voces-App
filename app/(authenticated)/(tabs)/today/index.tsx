import BackgroundLogo from "@/components/BackgroundLogo";
import Fab from "@/components/Fab";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Page = () => {  
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: top, flex: 1 }}>
      <BackgroundLogo opacity={1} position="left" />
      <Text>Today</Text>
      <Fab />
    </View>
  );
}

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});