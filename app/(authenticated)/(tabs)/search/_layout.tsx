import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Search", 
          headerShadowVisible: false,
          headerLargeTitle: true, 
          headerLargeTitleStyle: { fontSize: 24, fontWeight: "bold" }, 
          headerTitleAlign: "center", 
          headerSearchBarOptions: {
            placeholder: "Search",
            tintColor: Colors.primary,
            hideNavigationBar: true,
            hideWhenScrolling: true,
          }, 
        }} 
      />
    </Stack>
  );
};

export default Layout;