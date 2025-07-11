import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface PracticeInfo {
  id: string;
  practice_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  team_members: string[];
}

interface Device {
  device_id: string;
  name: string;
  added_date: string;
}

export default function Settings() {
  const { user } = useUser();
  const userId = user?.id;
  const [practice, setPractice] = useState<PracticeInfo | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState<PracticeInfo | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    console.log('Fetching data for userId:', userId);
    fetchData(userId);
  }, [userId]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    // Fetch practice info
    const { data: pData, error: pError } = await supabase
      .from("practice_information")
      .select("id, practice_name, address, city, state, zip, phone, team_members")
      .eq("user_id", uid)
      .single();
    console.log('Practice info:', pData, pError);
    // Fetch devices
    const { data: dData } = await supabase
      .from("devices")
      .select("device_id, name, added_date")
      .eq("user_id", uid);
    setPractice(pData ? {
      ...pData,
      team_members: Array.isArray(pData.team_members) ? pData.team_members : [],
    } : null);
    setDevices(dData || []);
    setLoading(false);
  };

  const openEditModal = () => {
    if (practice) setEditForm({ ...practice });
    setEditModal(true);
  };
  const closeEditModal = () => setEditModal(false);

  const handleEditChange = (field: keyof PracticeInfo, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleTeamMemberChange = (idx: number, value: string) => {
    if (!editForm) return;
    const updated = [...editForm.team_members];
    updated[idx] = value;
    setEditForm({ ...editForm, team_members: updated });
  };

  const addTeamMember = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, team_members: [...editForm.team_members, ""] });
  };

  const removeTeamMember = (idx: number) => {
    if (!editForm) return;
    const updated = editForm.team_members.filter((_, i) => i !== idx);
    setEditForm({ ...editForm, team_members: updated });
  };

  const savePractice = async () => {
    if (!editForm) return;
    setEditLoading(true);
    await supabase
      .from("practice_information")
      .update({
        practice_name: editForm.practice_name,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        zip: editForm.zip,
        phone: editForm.phone,
        team_members: editForm.team_members,
      })
      .eq("id", editForm.id);
    setEditLoading(false);
    setEditModal(false);
    if (userId) fetchData(userId);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <>
          {/* Practice Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Practice Details</Text>
              <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Practice Name</Text>
            <Text style={styles.value}>{practice?.practice_name}</Text>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{practice?.address}</Text>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{practice?.city}</Text>
            <Text style={styles.label}>State</Text>
            <Text style={styles.value}>{practice?.state}</Text>
            <Text style={styles.label}>ZIP Code</Text>
            <Text style={styles.value}>{practice?.zip}</Text>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{practice?.phone}</Text>
            <Text style={styles.label}>Team Members</Text>
            {practice?.team_members && practice.team_members.length > 0 ? (
              practice.team_members.map((tm, idx) => (
                <Text key={idx} style={styles.value}>{tm}</Text>
              ))
            ) : (
              <Text style={styles.value}>No team members</Text>
            )}
          </View>
          {/* Devices Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Amazon Alexa Devices</Text>
            {devices.length === 0 ? (
              <Text style={styles.value}>No devices linked</Text>
            ) : (
              devices.map((d, idx) => (
                <View key={d.device_id} style={styles.deviceRow}>
                  <Text style={styles.deviceName}>{d.name || d.device_id}</Text>
                  <Text style={styles.deviceDate}>Added on {d.added_date ? new Date(d.added_date).toLocaleDateString() : "-"}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" transparent onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Practice Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Practice Name"
                value={editForm?.practice_name}
                onChangeText={v => handleEditChange("practice_name", v)}
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={editForm?.address}
                onChangeText={v => handleEditChange("address", v)}
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                value={editForm?.city}
                onChangeText={v => handleEditChange("city", v)}
              />
              <TextInput
                style={styles.input}
                placeholder="State"
                value={editForm?.state}
                onChangeText={v => handleEditChange("state", v)}
              />
              <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                value={editForm?.zip}
                onChangeText={v => handleEditChange("zip", v)}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={editForm?.phone}
                onChangeText={v => handleEditChange("phone", v)}
              />
              <Text style={styles.modalLabel}>Team Members</Text>
              {editForm?.team_members.map((tm, idx) => (
                <View key={idx} style={styles.teamRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder={`Team Member ${idx + 1}`}
                    value={tm}
                    onChangeText={v => handleTeamMemberChange(idx, v)}
                  />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeTeamMember(idx)}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addTeamMember}>
                <Text style={styles.addBtnText}>+ Add Team Member</Text>
              </TouchableOpacity>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeEditModal} disabled={editLoading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={savePractice} disabled={editLoading}>
                  <Text style={styles.saveButtonText}>{editLoading ? "Saving..." : "Save"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 24,
  },
  loading: {
    color: Colors.primary,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginTop: 8,
    marginBottom: 2,
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: Colors.dark,
    marginBottom: 2,
  },
  deviceRow: {
    marginTop: 10,
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.secondary,
  },
  deviceDate: {
    fontSize: 13,
    color: "#888",
  },
  editBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "92%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: "#fafbfc",
    color: Colors.dark,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 12,
    marginBottom: 4,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  removeBtn: {
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  removeBtnText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.dark,
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
