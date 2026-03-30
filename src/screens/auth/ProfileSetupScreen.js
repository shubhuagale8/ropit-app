import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, StatusBar,
} from "react-native";
import { colors, spacing, radius } from "../../theme";
import { useAuth } from "../../context/AuthContext";

export default function ProfileSetupScreen({ route, navigation }) {
  const { saveProfile } = useAuth();
  const location = route.params?.location || null;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ownerName: "",
    nurseryName: "",
    nurseryNameHi: "",
    city: location?.city || "",
    address: location?.label || "",
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.ownerName || !form.nurseryName || !form.city) {
      Alert.alert("Missing Info / जानकारी अधूरी है", "Please fill your name, nursery name, and city.");
      return;
    }
    setLoading(true);
    await saveProfile({
      ...form,
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            label: location.label,
            city: location.city,
            state: location.state,
            pincode: location.pincode,
          }
        : null,
    });
    setLoading(false);
    navigation.replace("Main");
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🌿</Text>
          <Text style={styles.title}>Setup your Nursery</Text>
          <Text style={styles.subtitle}>अपनी नर्सरी की जानकारी भरें</Text>
        </View>

        {/* Location summary banner */}
        {location ? (
          <View style={styles.locationBanner}>
            <Text style={styles.locationBannerIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationBannerTitle}>Location saved / लोकेशन सेव हुई</Text>
              <Text style={styles.locationBannerValue} numberOfLines={2}>{location.label}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.locationChangeBtn}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.locationMissingBanner} onPress={() => navigation.goBack()}>
            <Text style={styles.locationMissingIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationMissingTitle}>No location set</Text>
              <Text style={styles.locationMissingSubText}>Tap to go back and set your nursery location</Text>
            </View>
            <Text style={styles.locationChangeBtn}>Set →</Text>
          </TouchableOpacity>
        )}

        {/* Form card */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Your name / आपका नाम *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ravi Sharma"
              placeholderTextColor={colors.textMuted}
              value={form.ownerName}
              onChangeText={v => set("ownerName", v)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nursery name (English) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Shree Ram Nursery"
              placeholderTextColor={colors.textMuted}
              value={form.nurseryName}
              onChangeText={v => set("nurseryName", v)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nursery name (Hindi) / हिंदी में नाम</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. श्री राम नर्सरी"
              placeholderTextColor={colors.textMuted}
              value={form.nurseryNameHi}
              onChangeText={v => set("nurseryNameHi", v)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>City / शहर *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Pune, Nashik, Nagpur"
              placeholderTextColor={colors.textMuted}
              value={form.city}
              onChangeText={v => set("city", v)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Full address / पूरा पता</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Village, Taluka, District..."
              placeholderTextColor={colors.textMuted}
              value={form.address}
              onChangeText={v => set("address", v)}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>🌿 Start Using Ropit →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.green },
  container: { flexGrow: 1, paddingBottom: 32 },
  header: { alignItems: "center", paddingTop: 50, paddingBottom: 20 },
  emoji: { fontSize: 44, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: colors.white },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  locationBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.greenPale, borderRadius: radius.md,
    marginHorizontal: 16, marginBottom: 12, padding: 14,
    borderWidth: 1.5, borderColor: colors.greenMid,
  },
  locationBannerIcon: { fontSize: 22 },
  locationBannerTitle: { fontSize: 11, fontWeight: "700", color: colors.green, textTransform: "uppercase", letterSpacing: 0.4 },
  locationBannerValue: { fontSize: 13, color: colors.text, marginTop: 2, fontWeight: "500" },
  locationChangeBtn: { color: colors.green, fontWeight: "700", fontSize: 13 },
  locationMissingBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.amberLight, borderRadius: radius.md,
    marginHorizontal: 16, marginBottom: 12, padding: 14,
    borderWidth: 1.5, borderColor: "#f5c518",
  },
  locationMissingIcon: { fontSize: 22 },
  locationMissingTitle: { fontSize: 13, fontWeight: "700", color: colors.amber },
  locationMissingSubText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    margin: 16, padding: spacing.xxl,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  field: { marginBottom: 18 },
  label: {
    fontSize: 11, fontWeight: "700", color: colors.textMuted,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
  },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: colors.text, backgroundColor: colors.bg,
  },
  multiline: { height: 80, textAlignVertical: "top" },
  btn: {
    backgroundColor: colors.green, borderRadius: radius.md,
    paddingVertical: 15, alignItems: "center", marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
