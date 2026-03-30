import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Linking, StatusBar, ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { subscribeBookings, updateBookingStatus } from "../../config/firebase";
import { colors, spacing, radius } from "../../theme";

const TABS   = ["pending", "accepted", "rejected"];
const LABELS = { pending: "Pending", accepted: "Confirmed", rejected: "Rejected" };
const SC     = {
  pending:  { bg: colors.amberLight, text: colors.amber,  border: "#f5c518" },
  accepted: { bg: colors.greenPale,  text: colors.green,  border: colors.greenMid },
  rejected: { bg: colors.redLight,   text: colors.red,    border: "#ffcccc" },
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab]           = useState("pending");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    const unsub = subscribeBookings(uid, (data) => {
      setBookings(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleStatus = (bookingId, newStatus) => {
    const label = newStatus === "accepted" ? "Accept" : "Reject";
    Alert.alert(`${label} Booking?`, `Are you sure you want to ${label.toLowerCase()} this?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: label, style: newStatus === "rejected" ? "destructive" : "default",
        onPress: async () => {
          try { await updateBookingStatus(bookingId, newStatus); }
          catch { Alert.alert("Error", "Could not update booking."); }
        },
      },
    ]);
  };

  const filtered     = bookings.filter(b => b.status === tab);
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const renderCard = ({ item: b }) => {
    const s = SC[b.status] || SC.pending;
    return (
      <View style={[styles.card, { borderLeftColor: s.border, borderLeftWidth: 4 }]}>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.statusText, { color: s.text }]}>
            {b.status === "pending" ? "⏳" : b.status === "accepted" ? "✅" : "❌"} {LABELS[b.status]}
          </Text>
        </View>

        <View style={styles.farmerRow}>
          <View style={styles.avatar}><Text style={{ fontSize: 22 }}>👨‍🌾</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.farmerName}>{b.farmerName || "Unknown Farmer"}</Text>
            <Text style={styles.farmerPhone}>{b.farmerPhone || "No phone"}</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => b.farmerPhone ? Linking.openURL(`tel:${b.farmerPhone}`) : Alert.alert("No phone", "Phone number not available.")}
          >
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.details}>
          {[
            ["🌱","Plant",    b.plantName || "—"],
            b.variety ? ["🏷️","Variety", b.variety] : null,
            ["📦","Quantity", `${b.quantity || 0} plants`],
            ["📅","Pickup",   b.pickupDate || "Not specified"],
          ].filter(Boolean).map(([icon, lbl, val]) => (
            <View key={lbl} style={styles.detailRow}>
              <Text style={styles.detailIcon}>{icon}</Text>
              <Text style={styles.detailLabel}>{lbl}</Text>
              <Text style={styles.detailValue}>{val}</Text>
            </View>
          ))}
        </View>

        {b.status === "pending" && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleStatus(b.id, "rejected")}>
              <Text style={styles.rejectText}>✕  Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleStatus(b.id, "accepted")}>
              <Text style={styles.acceptText}>✓  Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bookings / बुकिंग</Text>
          <Text style={styles.headerSub}>Farmer booking requests</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} new</Text>
          </View>
        )}
      </View>

      <View style={styles.tabRow}>
        {TABS.map(t => {
          const count = bookings.filter(b => b.status === t).length;
          return (
            <TouchableOpacity key={t} style={[styles.tab, tab===t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab===t && styles.tabTextActive]}>
                {LABELS[t]}{count > 0 ? ` (${count})` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.green} size="large" /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 52 }}>{tab==="pending"?"📋":tab==="accepted"?"✅":"❌"}</Text>
          <Text style={styles.emptyText}>No {LABELS[tab]} bookings</Text>
          <Text style={styles.emptySubText}>
            {tab==="pending" ? "Farmer requests will appear here" : `No ${LABELS[tab].toLowerCase()} bookings yet`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.green, paddingTop: 50, paddingBottom: 16, paddingHorizontal: spacing.xl, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerTitle: { color: colors.white, fontWeight: "800", fontSize: 22 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  pendingBadge: { backgroundColor: colors.amber, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4 },
  pendingBadgeText: { color: colors.white, fontWeight: "700", fontSize: 12 },
  tabRow: { flexDirection: "row", backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.green },
  tabText: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: colors.green, fontWeight: "800" },
  card: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 14, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 3 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: "700" },
  farmerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.greenPale, alignItems: "center", justifyContent: "center" },
  farmerName: { fontWeight: "800", fontSize: 15, color: colors.text },
  farmerPhone: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  callBtn: { backgroundColor: colors.green, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8 },
  callBtnText: { color: colors.white, fontWeight: "700", fontSize: 12 },
  details: { padding: 14, gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailIcon: { fontSize: 14, width: 20 },
  detailLabel: { fontSize: 12, color: colors.textMuted, width: 72 },
  detailValue: { fontSize: 13, fontWeight: "600", color: colors.text, flex: 1 },
  actionRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border },
  rejectBtn: { flex: 1, paddingVertical: 13, alignItems: "center", borderRightWidth: 1, borderRightColor: colors.border },
  rejectText: { color: colors.red, fontWeight: "700", fontSize: 14 },
  acceptBtn: { flex: 1, paddingVertical: 13, alignItems: "center", backgroundColor: colors.greenPale },
  acceptText: { color: colors.green, fontWeight: "700", fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontWeight: "700", fontSize: 17, color: colors.text, marginBottom: 6, marginTop: 12 },
  emptySubText: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
});
