import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert,
} from "react-native";
import { colors, spacing, radius } from "../../theme";

export default function BasicInfoScreen({ navigation }) {
  const [nurseryName, setNurseryName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");

  const handleNext = () => {
    if (!nurseryName.trim()) return Alert.alert("Required", "Please enter nursery name.");
    if (!ownerName.trim()) return Alert.alert("Required", "Please enter owner name.");
    const digits = mobile.replace(/\D/g, "");
    if (digits.length !== 10) return Alert.alert("Invalid", "Enter a valid 10-digit mobile number.");

    navigation.navigate("OTPVerify", {
      nurseryName: nurseryName.trim(),
      ownerName: ownerName.trim(),
      phoneNumber: "+91" + digits,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.emoji}>🌿</Text>
          <Text style={styles.appName}>Ropit</Text>
          <Text style={styles.appSub}>नर्सरी मैनेजमेंट ऐप</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.progressDot, i === 1 && styles.progressDotActive]}>
              <Text style={[styles.progressNum, i === 1 && styles.progressNumActive]}>{i}</Text>
            </View>
          ))}
          <View style={styles.progressLine} />
        </View>
        <Text style={styles.stepLabel}>Step 1 of 3 — Basic Information</Text>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tell us about your nursery</Text>
          <Text style={styles.cardSub}>आपल्या नर्सरीबद्दल सांगा</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nursery Name / नर्सरीचे नाव *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Shree Ram Nursery"
              placeholderTextColor={colors.textMuted}
              value={nurseryName}
              onChangeText={setNurseryName}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Owner Name / मालकाचे नाव *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ravi Sharma"
              placeholderTextColor={colors.textMuted}
              value={ownerName}
              onChangeText={setOwnerName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mobile Number / मोबाईल नंबर *</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.code}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.btnText}>Next — Get OTP →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.green },
  container: { flexGrow: 1, backgroundColor: colors.green, alignItems: "center", paddingBottom: 32 },
  hero: { alignItems: "center", paddingTop: 52, paddingBottom: 20 },
  emoji: { fontSize: 48, marginBottom: 6 },
  appName: { fontSize: 36, fontWeight: "900", color: colors.white, letterSpacing: 1 },
  appSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  progressRow: {
    flexDirection: "row", alignItems: "center", marginTop: 16,
    marginBottom: 4, gap: 0,
  },
  progressDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center", marginHorizontal: 4,
  },
  progressDotActive: { backgroundColor: colors.white },
  progressNum: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  progressNumActive: { color: colors.green },
  progressLine: { display: "none" },
  stepLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 16 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xxl, width: "92%", maxWidth: 400,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: {
    fontSize: 11, fontWeight: "700", color: colors.textMuted,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
  },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: colors.text, backgroundColor: colors.bg,
  },
  phoneRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.sm, overflow: "hidden",
  },
  countryCode: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 12,
    backgroundColor: colors.greenPale,
    borderRightWidth: 1.5, borderRightColor: colors.border,
  },
  flag: { fontSize: 16 },
  code: { fontSize: 14, fontWeight: "700", color: colors.green },
  phoneInput: {
    flex: 1, fontSize: 15, color: colors.text,
    paddingHorizontal: 12, paddingVertical: 12, fontWeight: "600",
  },
  btn: {
    backgroundColor: colors.green, borderRadius: radius.md,
    paddingVertical: 15, alignItems: "center", marginTop: 8,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
