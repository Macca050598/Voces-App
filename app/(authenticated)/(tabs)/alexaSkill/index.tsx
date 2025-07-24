import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlexaSkill() {
  const { user } = useUser();
  const router = useRouter();
  const [convos, setConvos] = useState<any[]>([]);
  const [stats, setStats] = useState({
    lastUsed: null,
    total: 0,
    mostCommon: "",
    recentTypes: [] as string[],
  });

  useEffect(() => {
    const fetchConvos = async () => {
      // Step 1: Fetch device IDs for this user
      const { data: devices, error: deviceError } = await supabase
        .from("devices")
        .select("device_id")
        .eq("user_id", user?.id);
      if (deviceError || !devices || devices.length === 0) {
        setConvos([]);
        setStats({ lastUsed: null, total: 0, mostCommon: "", recentTypes: [] });
        return;
      }
      const deviceIds = devices.map((d: any) => d.device_id);
      // Step 2: Fetch conversations for these device IDs
      const { data } = await supabase
        .from("alexa_emergency")
        .select("*")
        .in("device_id", deviceIds)
        .order("start_timestamp", { ascending: false });
      setConvos(data || []);
      if (data && data.length > 0) {
        setStats({
          lastUsed: data[0].start_timestamp,
          total: data.length,
          mostCommon: mostCommonType(data),
          recentTypes: data.slice(0, 5).map((c: any) => c.emergency_type || "Unknown"),
        });
      } else {
        setStats({ lastUsed: null, total: 0, mostCommon: "", recentTypes: [] });
      }
    };
    fetchConvos();
  }, [user?.id]);

  function mostCommonType(data: any[]) {
    const counts: Record<string, number> = {};
    data.forEach(c => {
      const type = c.emergency_type || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="mic-circle-outline" size={48} color={Colors.primary} />
        <Text style={styles.title}>Alexa Skill</Text>
        <Text style={styles.subtitle}>Emergency voice assistant for your practice</Text>
      </View>

      <View style={styles.container}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Last Used</Text>
            <Text style={[styles.statValue, { color: stats.lastUsed ? Colors.primary : Colors.lightText }]}>
              {stats.lastUsed ? moment(stats.lastUsed).format("MMM D, HH:mm") : "Never"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Emergencies</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Most Common</Text>
            <Text style={styles.statValue}>{stats.mostCommon}</Text>
          </View>
        </View>

        {/* Recent Emergency Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Emergency Types</Text>
          <View style={styles.typeBadgesRow}>
            {stats.recentTypes.slice(0, 4).map((type, idx) => (
              <View key={idx} style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Past Conversations */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Past Conversations</Text>
          <TouchableOpacity onPress={() => router.push("/(authenticated)/alexaSkillSections/appusage")}> 
            <Text style={styles.linkText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={convos.slice(0, 3)}
          keyExtractor={item => item.conversation_id}
          renderItem={({ item }) => (
            <View style={styles.convoCard}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(authenticated)/alexaSkillSections/appusage", params: { convoId: item.conversation_id } })}
              >
                <Text style={styles.convoType}>{item.emergency_type || "Unknown"}</Text>
                <Text style={styles.convoDate}>{moment(item.start_timestamp).format("MMM D, HH:mm")}</Text>
                <View style={[styles.statusBadge, item.status === "active" ? styles.active : styles.completed]}>
                  <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noConvos}>No conversations yet.</Text>}
          contentContainerStyle={{ paddingBottom: 16 }}
        />

        {/* Guides */}
        <TouchableOpacity
          style={styles.guidesButton}
          onPress={() => router.push("/(authenticated)/alexaSkillSections/guides")}
        >
          <Ionicons name="book-outline" size={22} color="#fff" />
          <Text style={styles.guidesButtonText}>View Alexa Guides</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: { alignItems: "center", marginBottom: 24, marginTop: 50 },
  title: { fontSize: 28, fontWeight: "bold", color: Colors.dark, marginTop: 10 },
  subtitle: { fontSize: 15, color: Colors.lightText, marginTop: 4, textAlign: "center" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.lightText,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
  },
  section: { marginBottom: 10 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.dark, marginBottom: 8 },
  typeBadgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBadge: {
    backgroundColor: "#f6f6fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  typeBadgeText: { color: Colors.primary, fontWeight: "600", fontSize: 14 },
  convoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
  },
  convoType: { fontWeight: "bold", color: Colors.dark, fontSize: 16 },
  convoDate: { color: Colors.lightText, fontSize: 13, marginTop: 2 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 6,
    marginBottom: 2,
  },
  active: {
    backgroundColor: "#ffe066",
  },
  completed: {
    backgroundColor: "#e0e0e0",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.dark,
  },
  noConvos: { color: Colors.lightText, textAlign: "center", marginTop: 10 },
  guidesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  guidesButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 10 },
  linkText: { color: Colors.primary, fontWeight: "600", fontSize: 15 },
}); 