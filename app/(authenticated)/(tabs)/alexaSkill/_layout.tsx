import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background }, headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Web App", 
          headerLargeTitle: true, 
          headerLargeTitleStyle: { fontSize: 24, fontWeight: "bold" }, 
          headerTitleAlign: "center", 
        }} 
      />
    </Stack>
  );
};

export default Layout; 