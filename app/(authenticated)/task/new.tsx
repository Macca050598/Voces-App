import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

export default function NewTask() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Task</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 20,
  },
});
