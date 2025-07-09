import { Colors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Image, StyleSheet } from "react-native";

const Layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Browse", 
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
  return (
  // <Link href="/browse/settings" asChild>
    <Ionicons name="settings-outline" size={24} color="black" />
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