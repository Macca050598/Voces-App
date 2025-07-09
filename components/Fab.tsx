import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

const Fab = () => {
  const router = useRouter();

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(authenticated)/task/new");
  }
  
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={28} color="white" />
    </TouchableOpacity>
  );
};

export default Fab;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 10,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.5)",
  },
});