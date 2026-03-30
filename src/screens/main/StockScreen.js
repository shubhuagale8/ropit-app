import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { subscribePlants, deletePlant } from "../../config/firebase";
import { colors, spacing, radius } from "../../theme";

export default function StockScreen({ navigation }) {
  const [plants, setPlants]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    // Real-time Firestore listener
    const unsub = subscribePlants(uid, (data) => {
      setPlants(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = (plant) => {
    Alert.alert("Delete Plant", `Delete "${plant.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const uid = auth().currentUser?.uid;
          if (!uid || !plant.firestoreId) return;
          try { await deletePlant(uid, plant.firestoreId); }
          catch { Alert.alert("Error", "Could not delete plant."); }
        },
      },
    ]);
  };

  const renderItem = ({ item: p }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.emoji}>{p.img || "🌱"}</Text>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>
              {p.variety ? <Text style={styles.variety}>Variety: {p.variety}</Text> : null}
            </View>
            <View style={[styles.tag, { backgroundColor: p.qty > 0 ? colors.greenPale : colors.redLight }]}>
              <Text style={[styles.tagText, { color: p.qty > 0 ? colors.green : colors.red }]}>
                {p.qty > 0 ? "Available" : "Out of Stock"}
              </Text>
            </View>
          </View>
          <Text style={styles.nameHi}>{p.nameHi} · {p.type}</Text>
          <View style={styles.metaRow}>
            {[["📦",`${p.qty} plants`],["🌱",p.age||"—"],["💰",`₹${p.price}/pc`]].map(([icon,val]) => (
              <View key={icon} style={styles.metaItem}>
                <Text style={styles.metaIcon}>{icon}</Text>
                <Text style={styles.metaVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("EditPlant", { plant: p })}>
          <Text style={styles.editBtnText}>✏️  Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(p)}>
          <Text style={styles.deleteBtnText}>🗑  Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Stock</Text>
          <Text style={styles.headerSub}>माझा स्टॉक</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddPlant")}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.green} size="large" /></View>
      ) : plants.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 52 }}>🌱</Text>
          <Text style={styles.emptyText}>No plants listed yet</Text>
          <Text style={styles.emptySubText}>Add your first plant to start selling</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("AddPlant")}>
            <Text style={styles.emptyBtnText}>+ Add Plant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={item => item.firestoreId || item.id || Math.random().toString()}
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
  header: { backgroundColor: colors.green, paddingTop: 50, paddingBottom: 18, paddingHorizontal: spacing.xl, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerTitle: { color: colors.white, fontWeight: "800", fontSize: 22 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: colors.white, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: colors.green, fontWeight: "700", fontSize: 14 },
  card: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 2, overflow: "hidden" },
  cardTop: { flexDirection: "row", gap: 12, padding: 14 },
  emoji: { fontSize: 36, lineHeight: 44 },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontWeight: "800", fontSize: 15, color: colors.text },
  variety: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  nameHi: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 8 },
  tag: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaIcon: { fontSize: 12 },
  metaVal: { fontSize: 12, fontWeight: "600", color: colors.text },
  btnRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border },
  editBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRightWidth: 1, borderRightColor: colors.border },
  editBtnText: { color: colors.green, fontWeight: "700", fontSize: 13 },
  deleteBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  deleteBtnText: { color: colors.red, fontWeight: "700", fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontWeight: "700", fontSize: 18, color: colors.text, marginTop: 12, marginBottom: 6 },
  emptySubText: { fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 24 },
  emptyBtn: { backgroundColor: colors.green, borderRadius: radius.md, paddingHorizontal: 28, paddingVertical: 13 },
  emptyBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
});
