import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MedicalSupply from "../../alexaSkillSections/medicalSupply";
import PharmacySupply from "../../alexaSkillSections/pharmacySupply";

export default function Supplys() {
  const { user } = useUser();
  const userId = user?.id;
  const [medical, setMedical] = useState<any[]>([]);
  const [pharmacy, setPharmacy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicalModalVisible, setMedicalModalVisible] = useState(false);
  const [pharmacyModalVisible, setPharmacyModalVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetchData = async () => {
      const { data: medData } = await supabase
        .from("medicaltracking")
        .select("*")
        .eq("user_id", userId);
      const { data: pharmData } = await supabase
        .from("pharmacytracking")
        .select("*")
        .eq("user_id", userId);
      setMedical(medData || []);
      setPharmacy(pharmData || []);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  // Stats
  const soonExpiring = [...medical, ...pharmacy]
    .filter(item => item.expiration_date && moment(item.expiration_date).isAfter(moment()) && moment(item.expiration_date).diff(moment(), "days") <= 30)
    .sort((a, b) => moment(a.expiration_date).diff(moment(b.expiration_date)))
    .slice(0, 3);

  const recentlyUsed = [...medical, ...pharmacy]
    .filter(item => item.usage_history && item.usage_history.length > 0)
    .sort((a, b) => moment(b.usage_history[0]?.timestamp).diff(moment(a.usage_history[0]?.timestamp)))
    .slice(0, 3);

  // Section rendering
  // Remove activeSection logic

  // Dashboard
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supplies Dashboard</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Medical</Text>
          <Text style={styles.statValue}>{medical.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Pharmacy</Text>
          <Text style={styles.statValue}>{pharmacy.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Expiring Soon</Text>
          <Text style={[styles.statValue, { color: "#ff9800" }]}>{soonExpiring.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Expiring Soon</Text>
      {soonExpiring.length === 0 ? (
        <Text style={styles.noSupplies}>No supplies expiring soon.</Text>
      ) : (
        soonExpiring.map(item => (
          <View key={item.id} style={styles.expiringCard}>
            <Text style={styles.expiringName}>{item.drug_name}</Text>
            <Text style={styles.expiringDate}>Expires: {moment(item.expiration_date).format("MMM D, YYYY")}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Recently Used</Text>
      {recentlyUsed.length === 0 ? (
        <Text style={styles.noSupplies}>No recent usage.</Text>
      ) : (
        recentlyUsed.map(item => (
          <View key={item.id} style={styles.expiringCard}>
            <Text style={styles.expiringName}>{item.drug_name}</Text>
            <Text style={styles.expiringDate}>
              Last used: {moment(item.usage_history[0]?.timestamp).format("MMM D, YYYY")}
            </Text>
          </View>
        ))
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.bigButton} onPress={() => setMedicalModalVisible(true)}>
          <Ionicons name="medkit-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Medical Supplies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bigButton} onPress={() => setPharmacyModalVisible(true)}>
          <Ionicons name="flask-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Pharmacy Supplies</Text>
        </TouchableOpacity>
      </View>

      {/* Medical Modal */}
      <Modal
        visible={medicalModalVisible}
        animationType="slide"
        onRequestClose={() => setMedicalModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setMedicalModalVisible(false)}>
            <Ionicons name="close" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <MedicalSupply />
        </View>
      </Modal>

      {/* Pharmacy Modal */}
      <Modal
        visible={pharmacyModalVisible}
        animationType="slide"
        onRequestClose={() => setPharmacyModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setPharmacyModalVisible(false)}>
            <Ionicons name="close" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <PharmacySupply />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 40, paddingHorizontal: 20, marginTop: 60 },
  title: { fontSize: 26, fontWeight: "bold", color: Colors.primary, marginBottom: 24, textAlign: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32, gap: 16 },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: { fontSize: 13, color: Colors.lightText, fontWeight: "600", marginBottom: 6, textAlign: "center" },
  statValue: { fontSize: 20, fontWeight: "bold", color: Colors.primary, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.primary, marginBottom: 10, marginTop: 18 },
  expiringCard: {
    backgroundColor: "#fff8e1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  expiringName: { fontWeight: "bold", color: Colors.primary, fontSize: 15 },
  expiringDate: { color: "#ff9800", fontSize: 13, marginTop: 2 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 32, gap: 16 },
  bigButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    justifyContent: "center",
    marginHorizontal: 4,
    gap: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: Colors.primary, flex: 1 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginLeft: 2,
  },
  expired: { backgroundColor: "#ffcccc" },
  inStock: { backgroundColor: "#d4f8e8" },
  statusText: { fontSize: 13, fontWeight: "bold", color: Colors.dark },
  cardDetail: { fontSize: 14, color: Colors.dark, marginTop: 2 },
  noSupplies: { color: Colors.lightText, textAlign: "center", marginTop: 30 },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  backBtnText: { color: Colors.primary, fontWeight: "bold", fontSize: 16, marginLeft: 6 },
  loading: { color: Colors.primary, fontWeight: "bold", fontSize: 16, marginTop: 30 },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
});