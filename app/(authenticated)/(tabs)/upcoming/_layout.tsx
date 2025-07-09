import MoreButton from "@/components/MoreButton";
import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Upcoming", 
          headerShadowVisible: false,
          headerLargeTitle: true, 
          headerLargeTitleStyle: { fontSize: 24, fontWeight: "bold" }, 
          headerTitleAlign: "center", 
          headerRight: () => <MoreButton pageName="Upcoming" /> 
        }} 
      />
    </Stack>
  );
};

export default Layout;