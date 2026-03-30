import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, StatusBar,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { savePlant } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, radius } from "../../theme";

const EMOJIS = ["🌱","🍅","🌶️","🍆","🥦","🌿","🥬","🌻","🍋","🥭","🧅","🧄","🌽","🫑","🥕"];
const TYPES  = ["Vegetable","Fruit","Flower","Herb","Tree","Other"];

export default function AddEditPlantScreen({ route, navigation }) {
  const existing = route.params?.plant;
  const isEdit   = !!existing;
  const { profile } = useAuth(); // get nursery profile for nurseryName

  const [form, setForm] = useState({
    name:     existing?.name     || "",
    nameHi:   existing?.nameHi   || "",
    variety:  existing?.variety  || "",
    type:     existing?.type     || "Vegetable",
    qty:      existing?.qty      !== undefined ? String(existing.qty)   : "",
    price:    existing?.price    !== undefined ? String(existing.price) : "",
    age:      existing?.age      || "",
    img:      existing?.img      || "🌱",
    status:   existing?.status   || "available",
    firestoreId: existing?.firestoreId || null,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Required", "Please enter plant name.");
      return;
    }
    if (!form.qty || isNaN(Number(form.qty))) {
      Alert.alert("Required", "Please enter a valid quantity.");
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      Alert.alert("Required", "Please enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) throw new Error("Not logged in.");

      // Pass nurseryName so it gets stored in the plant doc
      // (farmer app reads nurseryName from plant doc without extra query)
      const nurseryName = profile?.nurseryName || "";

      await savePlant(uid, form, nurseryName);

      Alert.alert(
        isEdit ? "Updated! ✅" : "Added! ✅",
        isEdit ? "Plant updated in database." : "Plant added to your stock.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert("Error", "Could not save plant.\n" + (e.message || ""));
    }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? "Edit Plant" : "Add New Plant"}</Text>
        <Text style={styles.headerSub}>{isEdit ? "स्टॉक अपडेट करा" : "नवीन पौधा जोडा"}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Emoji */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Plant icon</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map(e => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, form.img === e && styles.emojiBtnActive]}
                onPress={() => set("img", e)}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Names & Variety */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Plant Details</Text>

          <Text style={styles.label}>Plant name (English) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tomato"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={v => set("name", v)}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Plant name (Hindi) / हिंदी नाम</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. टमाटर"
            placeholderTextColor={colors.textMuted}
            value={form.nameHi}
            onChangeText={v => set("nameHi", v)}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Variety / व्हरायटी</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Hybrid, Desi, F1, Cherry"
            placeholderTextColor={colors.textMuted}
            value={form.variety}
            onChangeText={v => set("variety", v)}
          />
          <Text style={styles.hint}>Helps farmers find specific varieties</Text>

          <Text style={[styles.label, { marginTop: 12 }]}>Type / प्रकार</Text>
          <View style={styles.chipRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, form.type === t && styles.chipActive]}
                onPress={() => set("type", t)}
              >
                <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Qty, Price, Age */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Stock Info</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={String(form.qty)}
                onChangeText={v => set("qty", v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Price ₹ per plant *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={String(form.price)}
                onChangeText={v => set("price", v)}
              />
            </View>
          </View>
          <Text style={[styles.label, { marginTop: 12 }]}>Plant age / उम्र</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 25 days / 25 दिन"
            placeholderTextColor={colors.textMuted}
            value={form.age}
            onChangeText={v => set("age", v)}
          />
        </View>

        {/* Availability */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Availability / उपलब्धता</Text>
          <View style={styles.row}>
            {[
              ["available",    "✅  Available"],
              ["out_of_stock", "❌  Out of Stock"],
            ].map(([val, lbl]) => (
              <TouchableOpacity
                key={val}
                style={[styles.availBtn, form.status === val && styles.availBtnActive]}
                onPress={() => set("status", val)}
              >
                <Text style={[styles.availText, form.status === val && styles.availTextActive]}>
                  {lbl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.55 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>
                {isEdit ? "💾  Update Plant" : "🌱  Add Plant to Stock"}
              </Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.green,
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingBottom: 16, paddingHorizontal: 20,
  },
  backText:    { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600", marginBottom: 6 },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 22 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  scroll:  { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },

  card: {
    backgroundColor: colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, elevation: 2,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: "800", color: colors.textMuted,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12,
  },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 },
  hint:  { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: colors.text, backgroundColor: colors.bg,
  },
  row: { flexDirection: "row", gap: 12 },

  emojiGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emojiBtn:     { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  emojiBtnActive: { backgroundColor: colors.greenPale, borderColor: colors.green },

  chipRow:      { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border },
  chipActive:   { backgroundColor: colors.greenPale, borderColor: colors.green },
  chipText:     { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  chipTextActive: { color: colors.green },

  availBtn:       { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border, alignItems: "center" },
  availBtnActive: { backgroundColor: colors.greenPale, borderColor: colors.green },
  availText:      { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  availTextActive: { color: colors.green, fontWeight: "700" },

  saveBtn: {
    backgroundColor: colors.green, borderRadius: 12,
    paddingVertical: 16, alignItems: "center", marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
