import { Colors } from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Alert, Image, StyleSheet, TouchableOpacity } from "react-native";

const Layout = () => {

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "", 
          headerShadowVisible: false,
          headerLargeTitle: true, 
          headerLargeTitleStyle: { fontSize: 24, fontWeight: "bold" }, 
          headerTitleAlign: "center", 
          headerLeft: () => <HeaderLeft />,
          headerRight: () => <HeaderRight />,
        }} 
      />
    </Stack>
  );
};

const HeaderLeft = () => {
  const { user } = useUser();
  return <Image source={{ uri: user?.imageUrl }} style={styles.image} />;
};



const HeaderRight = () => {
  const { signOut } = useAuth();
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
  // <Link href="/browse/settings" asChild>
    <TouchableOpacity onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={30} color="red" />
      </TouchableOpacity>
  // </Link>
  )
};
const styles = StyleSheet.create({
  image: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
export default Layout;