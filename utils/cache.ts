
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const createTokenCache = () => {
    return {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
            console.log("Token retrieved from cache:", item);
            return item;
        } else {
            console.log("No token found in cache");
            return null;
        }
      } catch (err) {
        console.error("Error retrieving token from cache:", err);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        return SecureStore.setItemAsync(key, value);
      } catch (err) {  
        return;
      }
    },
  };
};

export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;