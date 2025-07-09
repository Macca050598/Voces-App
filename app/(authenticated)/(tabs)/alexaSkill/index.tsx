import BackgroundLogo from "@/components/BackgroundLogo";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARD_DATA = [
  { key: "app-usage", label: "App Usage", route: "/(authenticated)/alexaSkillSections/appusage" },
  { key: "guides", label: "Guides", route: "/(authenticated)/alexaSkillSections/guides" },
  { key: "medical-supplies", label: "Medical Supplies", route: "/(authenticated)/alexaSkillSections/medicalSupply" },
  { key: "settings", label: "Settings", route: "/(authenticated)/alexaSkillSections/settings" },
  { key: "store", label: "Store", route: "/(authenticated)/alexaSkillSections/store" },
];

export default function AlexaSkill() {
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase.from('alexa_emergency').select('*').limit(1);
      if (error) {
        console.log('Supabase connection error:', error);
      } else {
        console.log('Supabase connection success, sample data:', data);
      }
    };
    testSupabase();
  }, []);

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(authenticated)/alexaSkillSections/appusage");
  }
  return (
    <View style={[styles.container, { paddingTop: top }]}> 
      <BackgroundLogo opacity={1} position="right" />
      <Text style={styles.title}>Web App</Text>
      <FlatList
        data={CARD_DATA}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(item.route as any);
            }}
          >
            <Text style={styles.cardLabel}>{item.label}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const CARD_WIDTH = (Dimensions.get("window").width - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  grid: {
    gap: 18,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 1.1,
    backgroundColor: "#fff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardPressed: {
    backgroundColor: Colors.primary + "10",
    transform: [{ scale: 0.97 }],
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
}); 