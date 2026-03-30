import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export { auth, firestore };

// ── Auth ─────────────────────────────────────────────────────
export async function sendOTP(phoneNumber) {
  const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
  return confirmation;
}

export async function verifyOTP(confirmation, otp) {
  const result = await confirmation.confirm(otp);
  return result.user;
}

export async function signOutUser() {
  await auth().signOut();
}

// ── Nursery ──────────────────────────────────────────────────
// nurseries/{uid}
export async function saveNursery(uid, data) {
  const { nurseryName, ownerName, phoneNumber, latitude, longitude, address, city } = data;
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  await firestore()
    .collection("nurseries")
    .doc(uid)
    .set({
      uid,
      nurseryName:  nurseryName  || "",
      ownerName:    ownerName    || "",
      phoneNumber:  phoneNumber  || "",
      address:      address      || "",
      city:         city         || "",
      latitude:     lat,
      longitude:    lng,
      // GeoPoint stored correctly using firestore() instance
      location:     new firestore.GeoPoint(lat, lng),
      isActive:     true,
      createdAt:    firestore.FieldValue.serverTimestamp(),
      updatedAt:    firestore.FieldValue.serverTimestamp(),
    });
}

// Get nursery profile (used in AuthContext)
export async function getNurseryProfile(uid) {
  const doc = await firestore().collection("nurseries").doc(uid).get();
  if (doc.exists) return { id: doc.id, ...doc.data() };
  return null;
}

// ── Plants ───────────────────────────────────────────────────
// nurseries/{nurseryId}/plants/{plantId}
export async function savePlant(nurseryId, plant, nurseryName) {
  const qty   = Number(plant.qty)   || 0;
  const price = Number(plant.price) || 0;

  const searchTerms = [
    plant.name?.toLowerCase()    || "",
    plant.nameHi?.toLowerCase()  || "",
    plant.variety?.toLowerCase() || "",
    plant.type?.toLowerCase()    || "",
  ].filter(t => t.length > 0);

  const plantData = {
    name:        plant.name     || "",
    nameHi:      plant.nameHi   || "",
    variety:     plant.variety  || "",
    type:        plant.type     || "Vegetable",
    qty,
    price,
    age:         plant.age      || "",
    img:         plant.img      || "🌱",
    status:      plant.status   || "available",
    isAvailable: plant.status === "available" && qty > 0,
    nurseryId,
    nurseryName: nurseryName || "",
    searchTerms,
    updatedAt:   firestore.FieldValue.serverTimestamp(),
  };

  if (plant.firestoreId) {
    await firestore()
      .collection("nurseries").doc(nurseryId)
      .collection("plants").doc(plant.firestoreId)
      .update(plantData);
    return plant.firestoreId;
  } else {
    plantData.createdAt = firestore.FieldValue.serverTimestamp();
    const ref = await firestore()
      .collection("nurseries").doc(nurseryId)
      .collection("plants")
      .add(plantData);
    return ref.id;
  }
}

export async function deletePlant(nurseryId, firestoreId) {
  await firestore()
    .collection("nurseries").doc(nurseryId)
    .collection("plants").doc(firestoreId)
    .delete();
}

export function subscribePlants(nurseryId, callback) {
  return firestore()
    .collection("nurseries").doc(nurseryId)
    .collection("plants")
    .onSnapshot(
      snap => { callback(snap ? snap.docs.map(d => ({ firestoreId: d.id, ...d.data() })) : []); },
      err  => { console.log("subscribePlants:", err.message); callback([]); }
    );
}

// ── Bookings ─────────────────────────────────────────────────
// bookings/{bookingId}
export function subscribeBookings(nurseryId, callback) {
  return firestore()
    .collection("bookings")
    .where("nurseryId", "==", nurseryId)
    .onSnapshot(
      snap => { callback(snap ? snap.docs.map(d => ({ id: d.id, ...d.data() })) : []); },
      err  => { console.log("subscribeBookings:", err.message); callback([]); }
    );
}

export async function updateBookingStatus(bookingId, status) {
  await firestore().collection("bookings").doc(bookingId).update({
    status,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}
