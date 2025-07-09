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

interface Guide {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  duration: string;
  difficulty: string;
  favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Guide | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setGuides(data as Guide[]);
      setLoading(false);
    };
    fetchGuides();
  }, []);

  const openModal = (item: Guide) => {
    setSelected(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  // Helper for badge style
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return styles.beginner;
      case "intermediate":
        return styles.intermediate;
      case "advanced":
        return styles.advanced;
      default:
        return styles.beginner;
    }
  };

  const renderItem = ({ item }: { item: Guide }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        {item.favorite && <Text style={styles.star}>★</Text>}
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Text style={[styles.badge, getDifficultyStyle(item.difficulty)]}>{item.difficulty}</Text>
        <Text style={styles.duration}>{item.duration} read</Text>
      </View>
      <Text style={styles.category}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Guides</Text>
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(item) => item.id}
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
                  <Text style={styles.modalTitle}>{selected.title}</Text>
                  <Text style={styles.modalDescription}>{selected.description}</Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.badge, getDifficultyStyle(selected.difficulty)]}>{selected.difficulty}</Text>
                    <Text style={styles.duration}>{selected.duration} read</Text>
                  </View>
                  <Text style={styles.category}>{selected.category}</Text>
                  <Text style={styles.content}>{selected.content}</Text>
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
  pageTitle: {
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
  list: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
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
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    flex: 1,
    marginRight: 8,
  },
  star: {
    color: "#FFD700",
    fontSize: 20,
    marginLeft: 4,
  },
  description: {
    fontSize: 15,
    color: Colors.dark,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 10,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontWeight: "bold",
    fontSize: 13,
    color: "#fff",
    overflow: "hidden",
  },
  beginner: {
    backgroundColor: "#4CAF50",
  },
  intermediate: {
    backgroundColor: "#FFC107",
  },
  advanced: {
    backgroundColor: "#F44336",
  },
  duration: {
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 8,
  },
  category: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    fontStyle: "italic",
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
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.dark,
    marginBottom: 10,
    textAlign: "center",
  },
  content: {
    fontSize: 15,
    color: Colors.dark,
    marginTop: 18,
    lineHeight: 22,
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
