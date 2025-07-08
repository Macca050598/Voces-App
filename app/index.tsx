import { Colors } from "@/constants/Colors";
import { useOAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { top } = useSafeAreaInsets();

  // const { startOAuthFlow: startOAuthFlowApple } = useOAuth({
  //   strategy: "oauth_apple",
  // });

  const { startOAuthFlow: startOAuthFlowGoogle } = useOAuth({
    strategy: "oauth_google",
  });

//  const handleAppleOAuth = async () => {
//   try {
//     const { createdSessionId, setActive } = await startOAuthFlowApple();
//     console.log("createdSessionId Apple", createdSessionId);
//     if (createdSessionId) {
//       setActive!({ session: createdSessionId });
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

const handleGoogleOAuth = async () => {
  try {
    const { createdSessionId, setActive } = await startOAuthFlowGoogle();
    console.log("createdSessionId Google", createdSessionId);
    if (createdSessionId) {
      setActive!({ session: createdSessionId });
    }
  } catch (error) {
    console.error(error);
  }
};

const openLink = async () => {
  WebBrowser.openBrowserAsync("https://www.google.com");
};

  return (
    <View
      style={[styles.container, { marginTop: top }]}
    >
      {/* <Image source ={require("@/assets/images/Full Color Logo.png")} style={styles.logo} /> */}
      <Button title="Open Link" onPress={openLink} />
      <View style={styles.buttonsContainer}></View>
     
        <TouchableOpacity style={styles.button} onPress={handleGoogleOAuth}>
          {/* <Image source={require("@/assets/images/google.png")} style={styles.buttonIcon} /> */}
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>
        <View style={styles.termsContainer}>
        <Text style={styles.orText}>By continuing, you agree to our <Text style={styles.link} onPress={openLink}>Terms and Conditions</Text> and <Text style={styles.link} onPress={openLink}>Privacy Policy</Text></Text>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 40,
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonsContainer: {
    gap: 20,
    marginHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    width: "50%",
    alignSelf: "center",
  },
  buttonIcon: {
    width: 20,
    height: 20,
    },
  buttonText: {
    color: "#fff",
  },
  orText: {
    textAlign: "center",
    color: Colors.primary,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  termsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "80%", 
    alignSelf: "center",
  },
});