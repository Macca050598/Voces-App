import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';
import { DropdownMenu, MenuOption } from "@/components/menuTrigger";
import { useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MedicalSupply {
  id: string;
  drug_name: string;
  generic_name: string | null;
  manufacturer: string | null;
  lot_number: string | null;
  expiration_date: string | null;
  quantity: number;
  unit_of_measure: string | null;
  category: string | null;
  usage_history?: any[];
}

const UNITS = ["ml", "tablets", "vials", "ampoules", "capsules"];
const CATEGORIES = ["antibiotic", "antiseptic", "analgesic", "emergency", "anesthetic"];

export default function MedicalSupply() {
  const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<MedicalSupply | null>(null);
  const [usageAmount, setUsageAmount] = useState("");
  const [usageNotes, setUsageNotes] = useState("");
  const [addForm, setAddForm] = useState({
    drug_name: "",
    generic_name: "",
    manufacturer: "",
    lot_number: "",
    expiration_date: "",
    quantity: "",
    unit_of_measure: UNITS[0],
    category: CATEGORIES[0],
    storage_conditions: "",
    notes: "",
  });
  const { user } = useUser();
  const userId = user?.id;
  const [addLoading, setAddLoading] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [unitDropdownVisible, setUnitDropdownVisible] = useState(false);
  const [catDropdownVisible, setCatDropdownVisible] = useState(false);

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("medicaltracking")
      .select("id, drug_name, generic_name, manufacturer, lot_number, expiration_date, quantity, unit_of_measure, category, usage_history")
      .eq("user_id", userId)
      .order("drug_name", { ascending: true });

    if (!error && data) setSupplies(data as MedicalSupply[]);
    setLoading(false);
  };

  const getStatus = (expiration: string | null) => {
    if (!expiration) return { label: "In Stock", style: styles.inStock };
    const now = new Date();
    const exp = new Date(expiration);
    if (exp < now) return { label: "Expired", style: styles.expired };
    return { label: "In Stock", style: styles.inStock };
  };

  // Record Usage Modal Logic
  const openUsageModal = () => {
    setSelectedDrug(supplies[0] || null);
    setUsageAmount("");
    setUsageNotes("");
    setShowUsageModal(true);
  };
  const closeUsageModal = () => setShowUsageModal(false);
  const handleRecordUsage = async () => {
    if (!selectedDrug || !usageAmount || isNaN(Number(usageAmount))) return;
    setUsageLoading(true);
    const used = Number(usageAmount);
    const newQuantity = Math.max(0, selectedDrug.quantity - used);
    const newUsage = {
      amount: used,
      notes: usageNotes,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = Array.isArray(selectedDrug.usage_history)
      ? [newUsage, ...selectedDrug.usage_history]
      : [newUsage];
    const { error } = await supabase
      .from("medicaltracking")
      .update({
        quantity: newQuantity,
        usage_history: updatedHistory,
      })
      .eq("id", selectedDrug.id);
    setUsageLoading(false);
    if (!error) {
      closeUsageModal();
      fetchSupplies();
    }
  };

  // Add New Supply Modal Logic
  const openAddModal = () => {
    setAddForm({
      drug_name: "",
      generic_name: "",
      manufacturer: "",
      lot_number: "",
      expiration_date: "",
      quantity: "",
      unit_of_measure: UNITS[0],
      category: CATEGORIES[0],
      storage_conditions: "",
      notes: "",
    });
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAddForm(f => ({ ...f, expiration_date: selectedDate.toISOString().split('T')[0] }));
    }
  };
  const handleAddSupply = async () => {
    if (!addForm.drug_name || !addForm.quantity || isNaN(Number(addForm.quantity))) return;
    setAddLoading(true);
    const { error } = await supabase.from("medicaltracking").insert([
      {
        ...addForm,
        quantity: Number(addForm.quantity),
        user_id: userId, // <-- Add this line!
      },
    ]);
    setAddLoading(false);
    if (!error) {
      closeAddModal();
      fetchSupplies();
    }
  };

  const renderItem = ({ item }: { item: MedicalSupply }) => {
    const status = getStatus(item.expiration_date);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.drugName}>{item.drug_name}</Text>
          <View style={[styles.statusBadge, status.style]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.quantity}>{item.quantity} {item.unit_of_measure || ""}</Text>
          <Text style={styles.expiry}>{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "No Expiry"}</Text>
        </View>
        <View style={styles.cardDetails}>
          {item.generic_name && <Text style={styles.detailText}>Generic: {item.generic_name}</Text>}
          {item.manufacturer && <Text style={styles.detailText}>Manufacturer: {item.manufacturer}</Text>}
          {item.lot_number && <Text style={styles.detailText}>Lot: {item.lot_number}</Text>}
          {item.category && <Text style={styles.detailText}>Category: {item.category}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medical Supply Tracking</Text>
      <Text style={styles.subtitle}>Current Inventory</Text>
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={supplies}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, styles.fabLeft]} onPress={openUsageModal}>
          <Text style={styles.fabIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabRight]} onPress={openAddModal}>
          <Text style={styles.fabIcon}>＋</Text>
        </TouchableOpacity>
      </View>
      {/* Record Usage Modal */}
      <Modal visible={showUsageModal} animationType="slide" transparent onRequestClose={closeUsageModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Record Usage</Text>
              <Text style={styles.modalLabel}>Select Drug</Text>
              <View style={styles.selectBox}>
                {supplies.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {supplies.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.selectOption, selectedDrug?.id === s.id && styles.selectedOption]}
                        onPress={() => setSelectedDrug(s)}
                      >
                        <Text style={styles.selectOptionText}>{s.drug_name} ({s.quantity} {s.unit_of_measure || ""} available)</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
              <Text style={styles.modalLabel}>Amount Used</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={usageAmount}
                onChangeText={setUsageAmount}
                placeholder="0"
              />
              <Text style={styles.currentQty}>Current quantity: {selectedDrug?.quantity} {selectedDrug?.unit_of_measure || ""}</Text>
              <Text style={styles.modalLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={usageNotes}
                onChangeText={setUsageNotes}
                placeholder="Add any notes about the usage..."
                multiline
              />
              <Text style={styles.modalLabel}>Usage History</Text>
              <View style={styles.usageHistoryBox}>
                {selectedDrug?.usage_history && selectedDrug.usage_history.length > 0 ? (
                  selectedDrug.usage_history.map((u, idx) => (
                    <View key={idx} style={styles.usageRow}>
                      <Text style={styles.usageText}>{u.amount} used</Text>
                      <Text style={styles.usageText}>{u.notes}</Text>
                      <Text style={styles.usageText}>{new Date(u.timestamp).toLocaleString()}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.usageText}>No usage recorded</Text>
                )}
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeUsageModal} disabled={usageLoading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recordButton} onPress={handleRecordUsage} disabled={usageLoading}>
                  <Text style={styles.recordButtonText}>{usageLoading ? "Saving..." : "Record Usage"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Add New Supply Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={closeAddModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add New Medical Supply</Text>
              <TextInput
                style={styles.input}
                placeholder="Drug Name"
                value={addForm.drug_name}
                onChangeText={v => setAddForm(f => ({ ...f, drug_name: v }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Generic Name"
                value={addForm.generic_name}
                onChangeText={v => setAddForm(f => ({ ...f, generic_name: v }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Manufacturer"
                value={addForm.manufacturer}
                onChangeText={v => setAddForm(f => ({ ...f, manufacturer: v }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Lot Number"
                value={addForm.lot_number}
                onChangeText={v => setAddForm(f => ({ ...f, lot_number: v }))}
              />
              {/* Expiration Date (full width) */}
              <TouchableOpacity style={[styles.input, { justifyContent:'center', marginBottom: 10 }]} onPress={() => setShowDatePicker(true)}>
                <Text style={{color: addForm.expiration_date ? Colors.dark : '#888'}}>
                  {addForm.expiration_date ? addForm.expiration_date : 'Expiration Date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={addForm.expiration_date ? new Date(addForm.expiration_date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              {/* Quantity and Unit (side by side, chip style) */}
              <View style={styles.qtyUnitRow}>
                <TextInput
                  style={[styles.input, styles.qtyInput]}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={addForm.quantity}
                  onChangeText={v => setAddForm(f => ({ ...f, quantity: v }))}
                />
                <DropdownMenu
                  visible={unitDropdownVisible}
                  handleOpen={() => setUnitDropdownVisible(true)}
                  handleClose={() => setUnitDropdownVisible(false)}
                  trigger={
                    <TouchableOpacity style={styles.unitDropdownTrigger} onPress={() => setUnitDropdownVisible(true)}>
                      <Text style={styles.unitDropdownText}>{'unit'}</Text>
                    </TouchableOpacity>
                  }
                >
                  {UNITS.map(unit => (
                    <MenuOption
                      key={unit}
                      onSelect={() => {
                        setAddForm(f => ({ ...f, unit_of_measure: unit }));
                        setUnitDropdownVisible(false);
                      }}
                    >
                      <Text style={[styles.dropdownOptionText, { marginTop: 10 }]}>{unit}</Text>
                    </MenuOption>
                  ))}
                </DropdownMenu>
              </View>
              {/* Category Dropdown (full width) */}
              <DropdownMenu
                visible={catDropdownVisible}
                handleOpen={() => setCatDropdownVisible(true)}
                handleClose={() => setCatDropdownVisible(false)}
                trigger={
                  <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setCatDropdownVisible(true)}>
                    <Text style={styles.dropdownTriggerText}>{'Select category'}</Text>
                  </TouchableOpacity>
                }
              >
                {CATEGORIES.map(cat => (
                  <MenuOption
                    key={cat}
                    onSelect={() => {
                      setAddForm(f => ({ ...f, category: cat }));
                      setCatDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{cat}</Text>
                  </MenuOption>
                ))}
              </DropdownMenu>
              <TextInput
                style={[styles.input, { marginBottom: 10, marginTop: 10 }]}
                placeholder="Storage Conditions"
                value={addForm.storage_conditions}
                onChangeText={v => setAddForm(f => ({ ...f, storage_conditions: v }))}
              />
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Notes"
                value={addForm.notes}
                onChangeText={v => setAddForm(f => ({ ...f, notes: v }))}
                multiline
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeAddModal} disabled={addLoading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recordButton} onPress={handleAddSupply} disabled={addLoading}>
                  <Text style={styles.recordButtonText}>{addLoading ? "Saving..." : "Add Supply"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 16,
    fontWeight: "600",
  },
  list: {
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
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
  drugName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginLeft: 2,
  },
  expired: {
    backgroundColor: "#ffcccc",
  },
  inStock: {
    backgroundColor: "#d4f8e8",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.dark,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  expiry: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "500",
  },
  cardDetails: {
    marginTop: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  loading: {
    color: Colors.primary,
    textAlign: "center",
    marginTop: 40,
  },
  // Add FAB and modal styles below
  fabContainer: {
    position: "absolute",
    right: 24,
    bottom: 32,
    flexDirection: "column",
    alignItems: "flex-end",
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  fabLeft: {
    // for future: position left if needed
  },
  fabRight: {
    // for future: position right if needed
  },
  fabIcon: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
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
    maxHeight: Platform.OS === "ios" ? "80%" : "90%",
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
  modalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 12,
    marginBottom: 4,
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
  selectBox: {
    flexDirection: "row",
    marginBottom: 10,
  },
  selectOption: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
  },
  selectOptionText: {
    color: Colors.dark,
    fontWeight: "600",
  },
  currentQty: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 8,
  },
  usageHistoryBox: {
    backgroundColor: "#f6f6fa",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  usageRow: {
    marginBottom: 6,
  },
  usageText: {
    fontSize: 13,
    color: Colors.dark,
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
  recordButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  recordButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  row2col: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerCol: {
    flex: 1,
    backgroundColor: '#fafbfc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    height: 48,
  },
  picker: {
    width: '100%',
    height: 48,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafbfc',
    minHeight: 48,
    justifyContent: 'center',
  },
  dropdownTriggerText: {
    fontSize: 15,
    color: Colors.dark,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: Colors.dark,
    paddingVertical: 4,
  },
  qtyUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  qtyInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 5,
  },
  unitDropdownTrigger: {
    flex: 1,
    minWidth: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unitDropdownText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '600',
  },
});
