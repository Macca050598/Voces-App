import BackgroundLogo from "@/components/BackgroundLogo";
import Fab from "@/components/Fab";
import { StyleSheet, View } from "react-native";

const Page = () => {  

  return (
    <View style={styles.container}>
            <BackgroundLogo opacity={1} position="left" />

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