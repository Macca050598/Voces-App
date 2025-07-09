import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AlexaEmergency {
  conversation_id: string;
  device_id: string;
  start_timestamp: string;
  end_timestamp: string | null;
  status: string;
  emergency_type: string | null;
  symptoms_described: string | null;
  messages: any[];
}

export default function AppUsage() {
  const [conversations, setConversations] = useState<AlexaEmergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AlexaEmergency | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("alexa_emergency")
        .select("*")
        .order("start_timestamp", { ascending: false });
      if (!error && data) setConversations(data as AlexaEmergency[]);
      setLoading(false);
    };
    fetchConversations();
  }, []);


  // Always treat messages as an array
  const safeMessages = Array.isArray(selected?.messages)
    ? selected.messages
    : (selected?.messages ? JSON.parse(selected.messages) : []);

  const openModal = (item: AlexaEmergency) => {
    setSelected(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const renderItem = ({ item }: { item: AlexaEmergency }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.type}>
          {item.emergency_type || "Unspecified Emergency"}
        </Text>
        <View
          style={[styles.statusBadge, item.status === "active" ? styles.active : styles.completed]}
        >
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
      </View>
      {/* <Text style={styles.device}>Device: {item.device_id}</Text> */}
      <Text style={styles.timestamp}>{new Date(item.start_timestamp).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usage Statistics</Text>
      <Text style={styles.subtitle}>Past Alexa Conversations</Text>
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversation_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>

              {selected && (
                <>
                  <Text style={styles.modalTitle}>Emergency Details</Text>
                  <Text style={styles.modalLabel}>Type: <Text style={styles.modalValue}>{selected.emergency_type || "Unspecified"}</Text></Text>
                  <Text style={styles.modalLabel}>Status: <Text style={styles.modalValue}>{selected.status}</Text></Text>
                  <Text style={styles.modalLabel}>Device: <Text style={styles.modalValue}>{selected.device_id}</Text></Text>
                  <Text style={styles.modalLabel}>Started: <Text style={styles.modalValue}>{new Date(selected.start_timestamp).toLocaleString()}</Text></Text>
                  <Text style={styles.modalLabel}>Ended: <Text style={styles.modalValue}>{selected.end_timestamp ? new Date(selected.end_timestamp).toLocaleString() : "Ongoing"}</Text></Text>
                  <Text style={styles.modalLabel}>Symptoms Described: <Text style={styles.modalValue}>{selected.symptoms_described || "None"}</Text></Text>
                  <Text style={[styles.modalLabel, { marginTop: 16 }]}>Conversation</Text>
                  {safeMessages && safeMessages.length > 0 ? (
                    safeMessages.map((msg: any, idx: number) => {
                      return (
                        <View key={idx} style={styles.messageBubble}>
                          <Text style={styles.messageRole}>
                            {msg.role ? (msg.role === "user" ? "Patient" : msg.role === "assistant" ? "Alexa" : msg.role) : "Unknown Role"}
                          </Text>
                          <Text style={styles.messageText}>
                            {msg.content || msg.text || JSON.stringify(msg)}
                          </Text>
                          {msg.timestamp && (
                            <Text style={styles.messageTimestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</Text>
                          )}
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noMessages}>No messages found or messages not an array.</Text>
                  )}
                </>
              )}
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
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
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 16,
    fontWeight: "600",
  },
  loading: {
    color: Colors.primary,
    textAlign: "center",
    marginTop: 40,
  },
  list: {
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 8,
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
    marginBottom: 6,
  },
  type: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "flex-start",
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
  device: {
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: "#888",
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
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 6,
  },
  modalValue: {
    fontWeight: "400",
    color: Colors.primary,
  },
  messageBubble: {
    backgroundColor: "#f6f6fa",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  messageRole: {
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: Colors.dark,
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    textAlign: "right",
  },
  noMessages: {
    color: Colors.dark,
    fontStyle: "italic",
    marginTop: 8,
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
