import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Browse" }} />
    </Stack>
  );
};

export default Layout;