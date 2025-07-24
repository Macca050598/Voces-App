import { Colors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const quickLinks = [
  {
    label: "Tasks",
    icon: "bookmark-outline",
    route: "/(authenticated)/(tabs)/tasks",
  },
  {
    label: "Calendar",
    icon: "calendar-outline",
    route: "/(authenticated)/(tabs)/upcoming",
  },
  {
    label: "Medical Supply",
    icon: "medkit-outline",
    route: "/(authenticated)/alexaSkillSections/medicalSupply",
  },
  {
    label: "Pharmacy Supply",
    icon: "flask-outline",
    route: "/(authenticated)/alexaSkillSections/pharmacySupply",
  },
  {
    label: "Complaints",
    icon: "alert-circle-outline",
    route: "/(authenticated)/complaints",
  },
  {
    label: "Settings",
    icon: "settings-outline",
    route: "/(authenticated)/alexaSkillSections/settings",
  },
];

export default function Browse() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* User Greeting */}
      {/* <View style={styles.profileRow}>
        <Image
          source={user?.imageUrl ? { uri: user.imageUrl } : require("@/assets/images/Logo/Logo Mark - Color.png")}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user?.firstName || "User"}</Text>
        </View>
      </View> */}

      {/* Quick Links */}
      <Text style={styles.sectionTitle}>Quick Links</Text>
      <FlatList
        data={quickLinks}
        keyExtractor={item => item.label}
        numColumns={2}
        columnWrapperStyle={styles.linkRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons name={item.icon as any} size={28} color={Colors.primary} />
            <Text style={styles.linkLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Alexa Skill Summary */}
      <View style={styles.alexaCard}>
        <Ionicons name="mic-circle-outline" size={32} color={Colors.primary} style={{ marginBottom: 6 }} />
        <Text style={styles.alexaTitle}>Alexa Skill</Text>
        <Text style={styles.alexaDesc}>
          View your Alexa conversations, manage devices, and see usage stats.
        </Text>
        <TouchableOpacity
          style={styles.alexaButton}
          onPress={() => router.push("/(authenticated)/alexaSkillSections/appusage")}
        >
          <Text style={styles.alexaButtonText}>Go to Alexa Skill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 150,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    backgroundColor: "#eee",
  },
  greeting: {
    fontSize: 16,
    color: Colors.lightText,
    fontWeight: "500",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
  },
  sectionTitle: {
    marginTop: 130,
    fontSize: 18, 
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
  },
  linkRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  linkCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginHorizontal: 6,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  linkLabel: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
  },
  alexaCard: {
    backgroundColor: "#f6f6fa",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  alexaTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  alexaDesc: {
    fontSize: 14,
    color: Colors.lightText,
    textAlign: "center",
    marginBottom: 10,
  },
  alexaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  alexaButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});