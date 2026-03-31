import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, Platform,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { signOutUser } from "../../config/firebase";
import { colors, spacing, radius } from "../../theme";

export default function ProfileScreen() {
  const { user, profile } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out / साइन आउट",
      "Are you sure you want to sign out?\nक्या आप साइन आउट करना चाहते हैं?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out", style: "destructive",
          onPress: async () => {
            try { await signOutUser(); }
            catch (e) { Alert.alert("Error", e.message); }
          },
        },
      ]
    );
  };

  const rows = [
    { icon: "🏪", label: "Nursery Name", labelHi: "नर्सरीचे नाव",   value: profile?.nurseryName || "—" },
    { icon: "👤", label: "Owner Name",   labelHi: "मालकाचे नाव",     value: profile?.ownerName   || "—" },
    { icon: "📞", label: "Phone",        labelHi: "फोन नंबर",        value: user?.phoneNumber    || profile?.phoneNumber || "—" },
    { icon: "📍", label: "Address",      labelHi: "पत्ता",            value: profile?.address     || "Not set" },
    { icon: "🏙️", label: "City",         labelHi: "शहर",             value: profile?.city        || "Not set" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={{ fontSize: 38 }}>🌿</Text>
        </View>
        <Text style={styles.ownerName}>{profile?.ownerName || "Owner"}</Text>
        <Text style={styles.nurseryName}>{profile?.nurseryName || "Your Nursery"}</Text>
        <View style={styles.phonePill}>
          <Text style={styles.phoneText}>{user?.phoneNumber || "—"}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Info rows */}
        <View style={styles.card}>
          {rows.map((item, i) => (
            <View key={i} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{item.label} · <Text style={styles.rowLabelHi}>{item.labelHi}</Text></Text>
                <Text style={styles.rowValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={{ fontSize: 20 }}>🌿</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutTitle}>About Ropit</Text>
              <Text style={styles.aboutText}>
                Ropit connects nursery owners with farmers across India. Add your plant stock and let nearby farmers find you instantly.
              </Text>
              <Text style={styles.version}>Version 1.0.0  ·  Made with ❤️ for Indian farmers</Text>
            </View>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>🚪  Sign Out / साइन आउट</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.green,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 28, alignItems: "center",
  },
  avatarCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  ownerName:   { color: "#fff", fontWeight: "800", fontSize: 22 },
  nurseryName: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },
  phonePill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 8,
  },
  phoneText: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" },

  card: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, elevation: 2,
  },
  row:        { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  rowBorder:  { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon:    { fontSize: 20 },
  rowLabel:   { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  rowLabelHi: { color: colors.textMuted, fontWeight: "400" },
  rowValue:   { fontSize: 14, fontWeight: "600", color: colors.text, marginTop: 2 },

  aboutTitle: { fontWeight: "700", fontSize: 14, color: colors.text, marginBottom: 6 },
  aboutText:  { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  version:    { fontSize: 11, color: colors.textMuted, marginTop: 8 },

  signOutBtn: {
    backgroundColor: colors.redLight, borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
    borderWidth: 1, borderColor: "#ffcccc",
  },
  signOutText: { color: colors.red, fontWeight: "700", fontSize: 15 },
});
    