import { Colors } from "@/constants/Colors";
import { tokenCache } from "@/utils/cache";
import { ClerkLoaded, ClerkLoading, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { LogBox, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";




LogBox.ignoreLogs(['Clerk: Clerk has been loaded with development keys.']);

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing CLERK_PUBLISHABLE_KEY");
}

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segment = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;
    
    const inAuthGroup = segment[0] === "(authenticated)";
    
    if (isSignedIn && !inAuthGroup) {
      // User is signed in but not in authenticated group, redirect to authenticated area
      router.replace('/(authenticated)/(tabs)/today');
    } else if (!isSignedIn && pathname !== '/') {
      // User is not signed in but trying to access authenticated area, redirect to login
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, segment]);

  // Always render the Stack, even while loading or redirecting
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="index"/>
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
        <Toaster />
        <InitialLayout />
        </GestureHandlerRootView>
      </ClerkLoaded>
      <ClerkLoading>

        <Text>Loading...</Text>
      </ClerkLoading>
    </ClerkProvider>
  );
}

export default RootLayout;
