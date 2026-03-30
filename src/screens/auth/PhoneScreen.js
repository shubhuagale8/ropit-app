import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView, StatusBar,
} from "react-native";
import { sendOTP } from "../../config/firebase";
import { colors, spacing, radius } from "../../theme";

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const confirmation = await sendOTP("+91" + digits);
      setLoading(false);
      navigation.navigate("OTPVerify", {
        phoneNumber: "+91" + digits,
        confirmation,
      });
    } catch (error) {
      setLoading(false);
      let msg = "Failed to send OTP. Please try again.";
      if (error.code === "auth/invalid-phone-number")
        msg = "Invalid phone number.";
      else if (error.code === "auth/too-many-requests")
        msg = "Too many attempts. Wait a few minutes.";
      else if (error.code === "auth/network-request-failed")
        msg = "No internet. Check your connection.";
      Alert.alert("Error", msg);
    }
  };

  const isValid = phone.replace(/\D/g, "").length === 10;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.hero}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.logoText}>Ropit</Text>
          <Text style={styles.logoSub}>नर्सरी मैनेजमेंट ऐप</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Login / लॉगिन</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to receive an OTP{"\n"}अपना मोबाइल नंबर डालें
          </Text>

          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.flagText}>🇮🇳</Text>
              <Text style={styles.codeText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              autoFocus
            />
          </View>

          <Text style={styles.hint}>📩 We'll send a 6-digit OTP via SMS</Text>

          <TouchableOpacity
            style={[styles.btn, (!isValid || loading) && styles.btnDisabled]}
            onPress={handleSendOTP}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>Send OTP →</Text>}
          </TouchableOpacity>

          <Text style={styles.terms}>By continuing, you agree to our Terms of Service.</Text>
        </View>

        <Text style={styles.bottomNote}>Connecting nurseries with farmers across India 🌱</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.green },
  container: { flexGrow: 1, backgroundColor: colors.green, alignItems: "center", paddingBottom: 32 },
  hero: { alignItems: "center", paddingTop: 60, paddingBottom: 32 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoText: { fontSize: 40, fontWeight: "900", color: colors.white, letterSpacing: 1 },
  logoSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xxl, width: "90%", maxWidth: 380,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 24 },
  phoneRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, overflow: "hidden", marginBottom: 10,
  },
  countryCode: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 14,
    backgroundColor: colors.greenPale,
    borderRightWidth: 1.5, borderRightColor: colors.border,
  },
  flagText: { fontSize: 18 },
  codeText: { fontSize: 15, fontWeight: "700", color: colors.green },
  input: {
    flex: 1, fontSize: 18, fontWeight: "600", color: colors.text,
    paddingHorizontal: 14, paddingVertical: 14, letterSpacing: 1,
  },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: 20, textAlign: "center" },
  btn: {
    backgroundColor: colors.green, borderRadius: radius.md,
    paddingVertical: 15, alignItems: "center", marginBottom: 16,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  terms: { fontSize: 11, color: colors.textMuted, textAlign: "center", lineHeight: 16 },
  bottomNote: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 24, textAlign: "center" },
});
