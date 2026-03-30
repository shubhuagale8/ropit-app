import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, StatusBar, Platform,
} from "react-native";
import * as Location from "expo-location";
import { colors, spacing, radius } from "../../theme";

// ─── Reverse geocode using free OpenStreetMap Nominatim API ───
async function reverseGeocode(latitude, longitude) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const a = data.address || {};
    const village = a.village || a.suburb || a.neighbourhood || "";
    const city    = a.city || a.town || a.county || "";
    const state   = a.state || "";
    const pincode = a.postcode || "";
    const label   = [village, city, state].filter(Boolean).join(", ");
    return { label, village, city, state, pincode, latitude, longitude };
  } catch {
    return null;
  }
}

// ─── Search location by text using Nominatim ───────────────
async function searchLocation(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=5`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.map(r => ({
      label: r.display_name.split(",").slice(0, 3).join(",").trim(),
      fullLabel: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      city: r.display_name.split(",")[0]?.trim() || "",
      state: r.display_name.split(",").slice(-2, -1)[0]?.trim() || "",
      pincode: "",
      village: "",
    }));
  } catch {
    return [];
  }
}

export default function LocationPickerScreen({ navigation }) {
  const [mode, setMode] = useState(null);          // null | "auto" | "manual"
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);  // chosen location object

  // ── Auto GPS ──────────────────────────────────────────────
  const handleAutoLocation = async () => {
    setMode("auto");
    setGpsLoading(true);
    setSelected(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGpsLoading(false);
      Alert.alert(
        "Permission Denied",
        "Location permission is needed to find your nursery location.\nकृपया लोकेशन परमिशन दें।",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      const geo = await reverseGeocode(latitude, longitude);
      if (geo) {
        setSelected(geo);
      } else {
        // Fallback: just save raw coords
        setSelected({ latitude, longitude, label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, city: "", state: "", pincode: "", village: "" });
      }
    } catch (err) {
      Alert.alert("Error", "Could not get your location. Please try manual search.");
    }
    setGpsLoading(false);
  };

  // ── Manual search ─────────────────────────────────────────
  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setResults([]);
    const found = await searchLocation(query + " India");
    setResults(found);
    setSearchLoading(false);
    if (found.length === 0) {
      Alert.alert("Not found", "No results for that location. Try a different name or pincode.");
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    navigation.navigate("ProfileSetup", { location: selected });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.title}>Nursery Location</Text>
        <Text style={styles.subtitle}>नर्सरी की लोकेशन सेट करें</Text>
        <Text style={styles.hint}>
          This helps farmers find your nursery nearby.{"\n"}
          किसान आपकी नर्सरी आसानी से खोज सकेंगे।
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Option cards ── */}
        {!selected && (
          <View style={styles.optionRow}>
            {/* Auto GPS */}
            <TouchableOpacity
              style={[styles.optionCard, mode === "auto" && styles.optionCardActive]}
              onPress={handleAutoLocation}
              activeOpacity={0.85}
            >
              <Text style={styles.optionIcon}>📡</Text>
              <Text style={styles.optionTitle}>Use Current{"\n"}Location</Text>
              <Text style={styles.optionSub}>GPS से खोजें</Text>
              <View style={[styles.optionBadge, { backgroundColor: colors.greenPale }]}>
                <Text style={[styles.optionBadgeText, { color: colors.green }]}>Recommended</Text>
              </View>
            </TouchableOpacity>

            {/* Manual */}
            <TouchableOpacity
              style={[styles.optionCard, mode === "manual" && styles.optionCardActive]}
              onPress={() => { setMode("manual"); setSelected(null); }}
              activeOpacity={0.85}
            >
              <Text style={styles.optionIcon}>🔍</Text>
              <Text style={styles.optionTitle}>Enter{"\n"}Manually</Text>
              <Text style={styles.optionSub}>खुद से डालें</Text>
              <View style={[styles.optionBadge, { backgroundColor: colors.amberLight }]}>
                <Text style={[styles.optionBadgeText, { color: colors.amber }]}>City / Pincode</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── GPS loading state ── */}
        {mode === "auto" && gpsLoading && (
          <View style={styles.statusCard}>
            <ActivityIndicator color={colors.green} size="large" />
            <Text style={styles.statusText}>Getting your GPS location…</Text>
            <Text style={styles.statusSubText}>GPS से लोकेशन खोजी जा रही है</Text>
          </View>
        )}

        {/* ── Manual search box ── */}
        {mode === "manual" && !selected && (
          <View style={styles.card}>
            <Text style={styles.label}>Search city, village or pincode</Text>
            <Text style={styles.labelHi}>शहर, गांव या पिनकोड खोजें</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="e.g. Nashik, Pune, 422001"
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoFocus
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text style={styles.searchBtnText}>Search</Text>}
              </TouchableOpacity>
            </View>

            {/* Search results */}
            {results.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.resultRow}
                onPress={() => setSelected(r)}
              >
                <Text style={styles.resultIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{r.label}</Text>
                  <Text style={styles.resultFull} numberOfLines={1}>{r.fullLabel}</Text>
                </View>
                <Text style={styles.resultArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Selected location confirmation ── */}
        {selected && (
          <View style={styles.confirmedCard}>
            <View style={styles.confirmedHeader}>
              <Text style={styles.confirmedIcon}>✅</Text>
              <View>
                <Text style={styles.confirmedTitle}>Location Found!</Text>
                <Text style={styles.confirmedTitleHi}>लोकेशन मिल गई!</Text>
              </View>
            </View>

            <View style={styles.locationBox}>
              <Text style={styles.locationLabel}>{selected.label}</Text>
              {selected.pincode ? (
                <Text style={styles.locationMeta}>Pincode: {selected.pincode}</Text>
              ) : null}
              <Text style={styles.locationCoords}>
                📡 {selected.latitude?.toFixed(5)}, {selected.longitude?.toFixed(5)}
              </Text>
            </View>

            {/* Change location */}
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => { setSelected(null); setResults([]); setQuery(""); }}
            >
              <Text style={styles.changeBtnText}>🔄 Change Location</Text>
            </TouchableOpacity>

            {/* Confirm & proceed */}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Confirm & Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Skip option */}
        {!selected && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => navigation.navigate("ProfileSetup", { location: null })}
          >
            <Text style={styles.skipText}>Skip for now (set later in profile)</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.green },
  header: {
    alignItems: "center", paddingTop: 52, paddingBottom: 24, paddingHorizontal: 24,
  },
  emoji: { fontSize: 44, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: colors.white },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  hint: {
    fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center",
    marginTop: 10, lineHeight: 18,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },

  // Option cards
  optionRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  optionCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: radius.lg,
    padding: 18, alignItems: "center", gap: 6,
    borderWidth: 2, borderColor: "transparent",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  optionCardActive: { borderColor: colors.green },
  optionIcon: { fontSize: 36, marginBottom: 4 },
  optionTitle: {
    fontWeight: "800", fontSize: 15, color: colors.text, textAlign: "center", lineHeight: 20,
  },
  optionSub: { fontSize: 12, color: colors.textMuted },
  optionBadge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  optionBadgeText: { fontSize: 10, fontWeight: "700" },

  // Status (GPS loading)
  statusCard: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: 28, alignItems: "center", gap: 12, marginBottom: 16,
  },
  statusText: { fontWeight: "700", fontSize: 15, color: colors.text },
  statusSubText: { fontSize: 13, color: colors.textMuted },

  // Manual search card
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  label: { fontWeight: "700", fontSize: 14, color: colors.text, marginBottom: 2 },
  labelHi: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  searchInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: colors.text, backgroundColor: colors.bg,
  },
  searchBtn: {
    backgroundColor: colors.green, borderRadius: radius.sm,
    paddingHorizontal: 16, justifyContent: "center", alignItems: "center",
  },
  searchBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  resultRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border,
  },
  resultIcon: { fontSize: 18 },
  resultName: { fontWeight: "700", fontSize: 14, color: colors.text },
  resultFull: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  resultArrow: { fontSize: 20, color: colors.textMuted },

  // Confirmed location card
  confirmedCard: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  confirmedHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  confirmedIcon: { fontSize: 32 },
  confirmedTitle: { fontWeight: "800", fontSize: 16, color: colors.text },
  confirmedTitleHi: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  locationBox: {
    backgroundColor: colors.greenPale, borderRadius: radius.md,
    padding: 14, marginBottom: 14,
  },
  locationLabel: { fontWeight: "700", fontSize: 15, color: colors.green },
  locationMeta: { fontSize: 12, color: colors.greenLight, marginTop: 4 },
  locationCoords: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  changeBtn: {
    alignItems: "center", paddingVertical: 10, marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm,
  },
  changeBtnText: { color: colors.textMuted, fontWeight: "600", fontSize: 13 },
  confirmBtn: {
    backgroundColor: colors.green, borderRadius: radius.md,
    paddingVertical: 15, alignItems: "center",
  },
  confirmBtnText: { color: colors.white, fontWeight: "800", fontSize: 16 },

  // Skip
  skipBtn: { alignItems: "center", paddingVertical: 12 },
  skipText: { color: "rgba(255,255,255,0.65)", fontSize: 13, textDecorationLine: "underline" },
});
