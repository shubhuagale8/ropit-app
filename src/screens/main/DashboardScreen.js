import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator, Platform,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { subscribePlants, subscribeBookings } from "../../config/firebase";
import { colors, spacing, radius } from "../../theme";

export default function DashboardScreen({ navigation }) {
  const { profile } = useAuth();
  const [plants, setPlants]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    let ready = { plants: false, bookings: false };
    const checkReady = () => {
      if (ready.plants && ready.bookings) setLoading(false);
    };
    const unsubP = subscribePlants(uid, (data) => {
      setPlants(data);
      ready.plants = true;
      checkReady();
    });
    const unsubB = subscribeBookings(uid, (data) => {
      setBookings(data);
      ready.bookings = true;
      checkReady();
    });
    return () => { unsubP(); unsubB(); };
  }, []);

  const totalPlants    = plants.reduce((s, p) => s + (Number(p.qty) || 0), 0);
  const availablePlants = plants.filter(p => p.status === "available" && Number(p.qty) > 0).length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const totalBookings   = bookings.length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning 🌅";
    if (h < 17) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.green} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.ownerName}>{profile?.ownerName || "Nursery Owner"} 🌿</Text>
          <Text style={styles.nurseryName}>{profile?.nurseryName || "Your Nursery"}</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate("Profile")}>
          <Text style={{ fontSize: 28 }}>🌿</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { icon: "🌱", label: "Total Plants",    labelHi: "कुल पौधे",    value: totalPlants,     color: colors.green },
            { icon: "✅", label: "Available",        labelHi: "उपलब्ध",       value: availablePlants, color: colors.greenLight },
            { icon: "📅", label: "Bookings",         labelHi: "बुकिंग",       value: totalBookings,   color: colors.amber },
            { icon: "⏳", label: "Pending",          labelHi: "बाकी",         value: pendingBookings, color: colors.red, alert: pendingBookings > 0 },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, s.alert && styles.statCardAlert]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statLabelHi}>{s.labelHi}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions / त्वरित कार्य</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionPrimary} onPress={() => navigation.navigate("AddPlant")} activeOpacity={0.85}>
            <Text style={styles.actionPrimaryIcon}>🌱</Text>
            <Text style={styles.actionPrimaryText}>Add Plant</Text>
            <Text style={styles.actionPrimaryTextHi}>पौधा जोडा</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionSecondary} onPress={() => navigation.navigate("Bookings")} activeOpacity={0.85}>
            <Text style={styles.actionSecondaryIcon}>📅</Text>
            <Text style={styles.actionSecondaryText}>Bookings</Text>
            {pendingBookings > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{pendingBookings}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionSecondary} onPress={() => navigation.navigate("Stock")} activeOpacity={0.85}>
            <Text style={styles.actionSecondaryIcon}>📦</Text>
            <Text style={styles.actionSecondaryText}>My Stock</Text>
          </TouchableOpacity>
        </View>

        {/* Recent plants */}
        <Text style={styles.sectionTitle}>Recent Stock / हालिया स्टॉक</Text>
        {plants.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 44 }}>🌱</Text>
            <Text style={styles.emptyTitle}>No plants added yet</Text>
            <Text style={styles.emptySubtitle}>Add your first plant listing to get started</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("AddPlant")}>
              <Text style={styles.emptyBtnText}>+ Add First Plant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plants.slice(0, 4).map(p => (
            <TouchableOpacity
              key={p.firestoreId}
              style={styles.plantCard}
              onPress={() => navigation.navigate("EditPlant", { plant: p })}
              activeOpacity={0.85}
            >
              <Text style={styles.plantEmoji}>{p.img || "🌱"}</Text>
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>{p.name}
                  {p.nameHi ? <Text style={styles.plantNameHi}> · {p.nameHi}</Text> : null}
                </Text>
                {p.variety ? <Text style={styles.plantVariety}>Variety: {p.variety}</Text> : null}
                <Text style={styles.plantMeta}>₹{p.price}/plant  ·  Age: {p.age || "—"}</Text>
              </View>
              <View style={[styles.qtyBadge, Number(p.qty) > 0 ? styles.qtyBadgeGreen : styles.qtyBadgeRed]}>
                <Text style={[styles.qtyText, Number(p.qty) > 0 ? styles.qtyTextGreen : styles.qtyTextRed]}>
                  {Number(p.qty) > 0 ? `${p.qty}` : "Out"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {plants.length > 4 && (
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate("Stock")}>
            <Text style={styles.viewAllText}>View all {plants.length} plants →</Text>
          </TouchableOpacity>
        )}

        {/* Pending bookings alert */}
        {pendingBookings > 0 && (
          <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate("Bookings")} activeOpacity={0.85}>
            <Text style={{ fontSize: 22 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{pendingBookings} pending booking{pendingBookings > 1 ? "s" : ""}</Text>
              <Text style={styles.alertSubtitle}>Farmers are waiting for your response</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.green,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "flex-start",
  },
  greeting:    { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  ownerName:   { color: "#fff", fontWeight: "800", fontSize: 22, marginTop: 2 },
  nurseryName: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  avatarBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },

  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    padding: 16, gap: 10,
  },
  statCard: {
    width: "47%", backgroundColor: colors.white,
    borderRadius: 14, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, elevation: 2,
  },
  statCardAlert: { borderColor: colors.red, borderWidth: 1.5 },
  statIcon:      { fontSize: 24, marginBottom: 4 },
  statValue:     { fontSize: 28, fontWeight: "900" },
  statLabel:     { fontSize: 12, fontWeight: "700", color: colors.text, marginTop: 2 },
  statLabelHi:   { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  sectionTitle: {
    fontSize: 12, fontWeight: "800", color: colors.textMuted,
    textTransform: "uppercase", letterSpacing: 1,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
  },

  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  actionPrimary: {
    flex: 2, backgroundColor: colors.green, borderRadius: 14,
    padding: 16, alignItems: "center",
    shadowColor: colors.green, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, elevation: 4,
  },
  actionPrimaryIcon:   { fontSize: 28, marginBottom: 4 },
  actionPrimaryText:   { color: "#fff", fontWeight: "800", fontSize: 15 },
  actionPrimaryTextHi: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 },
  actionSecondary: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14,
    padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: colors.border, position: "relative",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, elevation: 2,
  },
  actionSecondaryIcon: { fontSize: 24, marginBottom: 4 },
  actionSecondaryText: { color: colors.text, fontWeight: "700", fontSize: 12 },
  badge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: colors.red, borderRadius: 9,
    width: 18, height: 18, alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  plantCard: {
    backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 14, flexDirection: "row",
    alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, elevation: 2,
  },
  plantEmoji:     { fontSize: 34 },
  plantInfo:      { flex: 1 },
  plantName:      { fontWeight: "700", fontSize: 15, color: colors.text },
  plantNameHi:    { fontWeight: "400", color: colors.textMuted },
  plantVariety:   { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  plantMeta:      { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  qtyBadge:       { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, minWidth: 44, alignItems: "center" },
  qtyBadgeGreen:  { backgroundColor: colors.greenPale },
  qtyBadgeRed:    { backgroundColor: colors.redLight },
  qtyText:        { fontSize: 13, fontWeight: "800" },
  qtyTextGreen:   { color: colors.green },
  qtyTextRed:     { color: colors.red },

  emptyCard: {
    backgroundColor: colors.white, margin: 16, borderRadius: 16,
    padding: 32, alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  emptyTitle:    { fontWeight: "700", fontSize: 17, color: colors.text, marginTop: 12, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginBottom: 20 },
  emptyBtn:      { backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText:  { color: "#fff", fontWeight: "700", fontSize: 14 },

  viewAllBtn: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: colors.white, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
    borderWidth: 1.5, borderColor: colors.green,
  },
  viewAllText: { color: colors.green, fontWeight: "700", fontSize: 14 },

  alertCard: {
    backgroundColor: colors.amberLight, margin: 16, borderRadius: 14,
    padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: "#f5c518",
  },
  alertTitle:    { fontWeight: "700", fontSize: 14, color: colors.text },
  alertSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  alertArrow:    { fontSize: 24, color: colors.amber, fontWeight: "700" },
});
