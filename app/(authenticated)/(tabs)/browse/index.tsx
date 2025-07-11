import { Colors } from "@/constants/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Browse() {
  const { signOut } = useAuth();
  const { top } = useSafeAreaInsets();
  const handleLogout = async () => {
    try {
      await signOut();
      // The redirect will be handled automatically by the auth flow in _layout.tsx
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
            {/* <Image source={require("@/assets/images/Logo/Full Color Logo Transparent.png")} style={styles.logo} /> */}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 140,
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignSelf: "flex-start",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 0,
    alignSelf: "center",
  },
});