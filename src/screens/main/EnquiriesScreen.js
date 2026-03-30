import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius } from "../../theme";

// Demo enquiries - replace with real Firebase data later
const DEMO = [
  { id: "1", farmer: "Ramesh Kumar", plant: "Tamatar", qty: 50, phone: "+919876543210", time: "2 hrs ago", read: false },
  { id: "2", farmer: "Suresh Patel", plant: "Mirch", qty: 30, phone: "+918765432109", time: "5 hrs ago", read: true },
];

export default function EnquiriesScreen() {
  const [enquiries, setEnquiries] = useState(DEMO);

  useFocusEffect(
    useCallback(() => {
      loadEnquiries();
    }, [])
  );

  const loadEnquiries = async () => {
    const stored = await AsyncStorage.getItem("enquiries");
    if (stored) setEnquiries(JSON.parse(stored));
  };

  const markRead = async (id) => {
    const updated = enquiries.map(e => e.id === id ? { ...e, read: true } : e);
    setEnquiries(updated);
    await AsyncStorage.setItem("enquiries", JSON.stringify(updated));
  };

  const callFarmer = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderItem = ({ item: eq }) => (
    <View style={[styles.card, !eq.read && styles.cardUnread]}>
      {!eq.read && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      {/* Farmer info */}
      <View style={styles.farmerRow}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 22 }}>👨‍🌾</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.farmerName}>{eq.farmer}</Text>
          <Text style={styles.time}>{eq.time}</Text>
        </View>
      </View>
      {/* Request */}
      <View style={styles.requestBox}>
        <Text style={styles.requestLabel}>Wants to buy / खरीदना चाहते हैं</Text>
        <Text style={styles.requestValue}>🌱 {eq.plant} — {eq.qty} plants</Text>
      </View>
      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.callBtn} onPress={() => callFarmer(eq.phone)}>
          <Text style={styles.callBtnText}>📞 Call {eq.phone}</Text>
        </TouchableOpacity>
        {!eq.read && (
          <TouchableOpacity style={styles.readBtn} onPress={() => markRead(eq.id)}>
            <Text style={styles.readBtnText}>✓ Read</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const unread = enquiries.filter(e => !e.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Enquiries</Text>
          <Text style={styles.headerSub}>पूछताछ {unread > 0 ? `· ${unread} new` : ""}</Text>
        </View>
      </View>

      {enquiries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 52 }}>📭</Text>
          <Text style={styles.emptyText}>No enquiries yet</Text>
          <Text style={styles.emptySubText}>
            When farmers search and contact you, their enquiries will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.green, paddingTop: 50, paddingBottom: 18,
    paddingHorizontal: spacing.xl,
  },
  headerTitle: { color: colors.white, fontWeight: "800", fontSize: 22 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 12, padding: spacing.lg, position: "relative",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: colors.amber },
  newBadge: {
    position: "absolute", top: 12, right: 12,
    backgroundColor: colors.amberLight, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  newBadgeText: { fontSize: 10, fontWeight: "700", color: colors.amber },
  farmerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.greenPale, alignItems: "center", justifyContent: "center",
  },
  farmerName: { fontWeight: "800", fontSize: 15, color: colors.text },
  time: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  requestBox: {
    backgroundColor: colors.bg, borderRadius: radius.sm,
    padding: 12, marginBottom: 12,
  },
  requestLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  requestValue: { fontWeight: "700", fontSize: 15, color: colors.text },
  actionRow: { flexDirection: "row", gap: 10 },
  callBtn: {
    flex: 1, backgroundColor: colors.green, borderRadius: radius.sm,
    paddingVertical: 11, alignItems: "center",
  },
  callBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  readBtn: {
    backgroundColor: colors.white, borderRadius: radius.sm,
    paddingVertical: 11, paddingHorizontal: 16, alignItems: "center",
    borderWidth: 1.5, borderColor: colors.border,
  },
  readBtnText: { color: colors.textMuted, fontWeight: "600", fontSize: 13 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontWeight: "700", fontSize: 18, color: colors.text, marginTop: 12, marginBottom: 8 },
  emptySubText: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
});
