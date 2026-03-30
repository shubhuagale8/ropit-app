import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { sendOTP, verifyOTP } from "../../config/firebase";
import { colors, spacing, radius } from "../../theme";

const OTP_LENGTH = 6;

export default function OTPVerifyScreen({ route, navigation }) {
  const { phoneNumber, nurseryName, ownerName } = route.params;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(true);
  const [confirmRef, setConfirmRef] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef([]);

  // Send OTP on mount
  useEffect(() => {
    doSendOTP();
  }, []);

  // Countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const doSendOTP = async () => {
    setSending(true);
    try {
      const conf = await sendOTP(phoneNumber);
      setConfirmRef(conf);
    } catch (e) {
      Alert.alert("Error", "Could not send OTP: " + e.message);
    }
    setSending(false);
  };

  const handleChange = (text, index) => {
    const val = text.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== "") && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code) => {
    const otpCode = code || otp.join("");
    if (otpCode.length < OTP_LENGTH) return Alert.alert("Incomplete", "Enter all 6 digits.");
    if (!confirmRef) return Alert.alert("Error", "OTP not sent yet. Please wait.");
    setLoading(true);
    try {
      await verifyOTP(confirmRef, otpCode);
      navigation.replace("LocationMap", { nurseryName, ownerName, phoneNumber });
    } catch (e) {
      Alert.alert("Wrong OTP", "Invalid OTP. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setResendTimer(30);
    await doSendOTP();
    inputs.current[0]?.focus();
  };

  const masked = phoneNumber.replace("+91", "").replace(/(\d{5})(\d{5})/, "*****$2");

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.emoji}>🌿</Text>
          <Text style={styles.appName}>Ropit</Text>

          {/* Progress */}
          <View style={styles.progressRow}>
            {[1,2,3].map(i => (
              <View key={i} style={[styles.dot, i <= 2 && styles.dotActive]}>
                <Text style={[styles.dotNum, i <= 2 && styles.dotNumActive]}>{i}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.stepLabel}>Step 2 of 3 — OTP Verification</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}><Text style={{ fontSize: 32 }}>📱</Text></View>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.sub}>
            6-digit code sent to{"\n"}
            <Text style={styles.phone}>+91 {masked}</Text>
          </Text>

          {sending ? (
            <View style={{ alignItems: "center", padding: 20 }}>
              <ActivityIndicator color={colors.green} />
              <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 13 }}>Sending OTP...</Text>
            </View>
          ) : (
            <>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={r => (inputs.current[i] = r)}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
                    value={digit}
                    onChangeText={t => handleChange(t, i)}
                    onKeyPress={e => handleKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    autoFocus={i === 0}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={() => handleVerify()}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={colors.white} />
                  : <Text style={styles.btnText}>Verify & Continue ✓</Text>}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <Text style={styles.resendLabel}>Didn't get OTP?  </Text>
                {resendTimer > 0
                  ? <Text style={styles.timer}>Resend in {resendTimer}s</Text>
                  : <TouchableOpacity onPress={handleResend}>
                      <Text style={styles.resendBtn}>Resend OTP</Text>
                    </TouchableOpacity>}
              </View>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.green },
  container: { flex: 1, backgroundColor: colors.green, alignItems: "center" },
  header: { width: "100%", paddingTop: 50, paddingHorizontal: 20, alignItems: "center", paddingBottom: 20 },
  backBtn: { position: "absolute", left: 20, top: 50 },
  backText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  emoji: { fontSize: 36, marginBottom: 4 },
  appName: { fontSize: 28, fontWeight: "900", color: colors.white, letterSpacing: 0.5 },
  progressRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 6 },
  dot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  dotActive: { backgroundColor: colors.white },
  dotNum: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  dotNumActive: { color: colors.green },
  stepLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 6 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xxl, width: "92%", maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    marginTop: 8,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.greenPale, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 6 },
  sub: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  phone: { fontWeight: "700", color: colors.green },
  otpRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  otpBox: {
    width: 44, height: 52, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.sm, fontSize: 22, fontWeight: "800", color: colors.text,
    backgroundColor: colors.bg,
  },
  otpBoxFilled: { borderColor: colors.green, backgroundColor: colors.greenPale },
  btn: {
    backgroundColor: colors.green, borderRadius: radius.md,
    paddingVertical: 14, paddingHorizontal: 40, alignItems: "center", width: "100%", marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  resendRow: { flexDirection: "row", alignItems: "center" },
  resendLabel: { fontSize: 13, color: colors.textMuted },
  timer: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  resendBtn: { fontSize: 13, color: colors.green, fontWeight: "700", textDecorationLine: "underline" },
});
