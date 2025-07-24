import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const SUPPORT_EMAIL = "support@vocesapp.com";
const SUPPORT_PHONE = "+44 1234 567890";

export default function Complaints() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleEmail = () => {
    const subject = encodeURIComponent("VocesApp Complaint/Feedback");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert("Error", "Could not open your email app.")
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.primary} />
        <Text style={styles.title}>Contact & Complaints</Text>
        <Text style={styles.subtitle}>
          Have feedback, a complaint, or need help? Reach out to us below.
        </Text>
      </View>

      <View style={styles.contactCard}>
        <Ionicons name="mail-outline" size={22} color={Colors.primary} />
        <Text style={styles.contactText}>{SUPPORT_EMAIL}</Text>
        <Ionicons name="call-outline" size={22} color={Colors.primary} style={{ marginTop: 10 }} />
        <Text style={styles.contactText}>{SUPPORT_PHONE}</Text>
      </View>

      <Text style={styles.sectionTitle}>Send us a message</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Your Message"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleEmail}
        disabled={!message.trim() || !email.trim()}
      >
        <Ionicons name="send" size={20} color="#fff" />
        <Text style={styles.sendButtonText}>Send via Email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20, paddingTop: 40 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 26, fontWeight: "bold", color: Colors.primary, marginTop: 8 },
  subtitle: { fontSize: 15, color: Colors.lightText, marginTop: 4, textAlign: "center" },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  contactText: { color: Colors.primary, fontWeight: "600", fontSize: 15, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.primary, marginBottom: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    justifyContent: "center",
    marginTop: 12,
  },
  sendButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 10 },
});
