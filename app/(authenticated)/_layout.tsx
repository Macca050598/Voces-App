import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task/newTask" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="alexaSkillSections/appusage" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="alexaSkillSections/guides" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="alexaSkillSections/medicalSupply" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="alexaSkillSections/pharmacySupply" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="alexaSkillSections/settings" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="complaints/index" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
};

export default Layout;