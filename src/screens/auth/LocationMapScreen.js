import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, StatusBar, Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import auth from "@react-native-firebase/auth";
import { saveNursery } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { colors, radius } from "../../theme";

const DEFAULT_REGION = {
  latitude:       19.7515,
  longitude:      75.7139,
  latitudeDelta:  0.05,
  longitudeDelta: 0.05,
};

export default function LocationMapScreen({ route, navigation }) {
  const { refreshProfile, pendingInfo } = useAuth();
  const nurseryName  = pendingInfo?.nurseryName  || route.params?.nurseryName  || "";
  const ownerName    = pendingInfo?.ownerName    || route.params?.ownerName    || "";
  const phoneNumber  = pendingInfo?.phoneNumber  || route.params?.phoneNumber  || "";
  const mapRef = useRef(null);

  const [region, setRegion]           = useState(DEFAULT_REGION);
  const [marker, setMarker]           = useState(null); // null until user picks
  const [address, setAddress]         = useState("");
  const [city, setCity]               = useState("");
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [saving, setSaving]           = useState(false);

  // Auto-fetch GPS on mount
  useEffect(() => {
    fetchGPS(false);
  }, []);

  const fetchGPS = async (showErrors = true) => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (showErrors) {
          Alert.alert(
            "Location Permission Needed",
            "Please allow location access so farmers can find your nursery nearby.\n\nYou can also tap anywhere on the map to place your pin manually.",
            [{ text: "OK" }]
          );
        }
        setGpsLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = pos.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta:  0.01,
        longitudeDelta: 0.01,
      };

      setMarker({ latitude, longitude });
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 800);
      reverseGeocode(latitude, longitude);
    } catch (e) {
      if (showErrors) {
        Alert.alert("GPS Error", "Could not get location. Tap the map to set your nursery pin manually.");
      }
    }
    setGpsLoading(false);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
        { headers: { "User-Agent": "RopitApp/1.0" } }
      );
      const data = await res.json();
      if (!data || data.error) return;
      const a = data.address || {};
      const cityVal = a.city || a.town || a.village || a.county || "";
      const parts = [
        a.village || a.suburb || a.neighbourhood || "",
        a.city    || a.town   || a.county        || "",
        a.state   || "",
      ].filter(Boolean);
      setAddress(parts.join(", "));
      setCity(cityVal);
    } catch {}
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleMarkerDrag = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleConfirm = async () => {
    if (!marker) {
      Alert.alert("No Location Set", "Please tap the map or use GPS to set your nursery location.");
      return;
    }
    setSaving(true);
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("Session Expired", "Please go back and login again.");
        setSaving(false);
        return;
      }

      await saveNursery(user.uid, {
        nurseryName,
        ownerName,
        phoneNumber,
        latitude:  marker.latitude,
        longitude: marker.longitude,
        address:   address || `${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}`,
        city,
      });

      // refreshProfile updates context → AppNavigator sees profile is now set → switches to Main automatically
      await refreshProfile();
    } catch (e) {
      console.log("Save error:", e.message);
      Alert.alert("Save Failed", "Could not save data. Please check internet and try again.\n\n" + e.message);
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📍 Set Nursery Location</Text>
        <Text style={styles.headerSub}>Step 3 of 3  ·  नर्सरीचे ठिकाण निवडा</Text>
      </View>

      {/* Google Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={DEFAULT_REGION}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass
          showsScale
          loadingEnabled
          loadingIndicatorColor={colors.green}
        >
          {marker && (
            <Marker
              coordinate={marker}
              draggable
              onDragEnd={handleMarkerDrag}
              title={nurseryName}
              description="Your nursery location"
            >
              {/* Custom green marker */}
              <View style={styles.markerContainer}>
                <View style={styles.markerPin}>
                  <Text style={styles.markerEmoji}>🌿</Text>
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* GPS button */}
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={() => fetchGPS(true)}
          disabled={gpsLoading}
          activeOpacity={0.85}
        >
          {gpsLoading
            ? <ActivityIndicator color={colors.green} size="small" />
            : <Text style={styles.gpsBtnText}>📡  My Location</Text>}
        </TouchableOpacity>

        {/* Hint if no marker */}
        {!marker && (
          <View style={styles.hintBanner}>
            <Text style={styles.hintText}>👆 Tap on the map to place your nursery pin</Text>
          </View>
        )}
      </View>

      {/* Bottom Panel */}
      <View style={styles.panel}>

        {/* Nursery info */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>🏪 Nursery</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{nurseryName}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>👤 Owner</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{ownerName}</Text>
          </View>
        </View>

        {/* Location info */}
        <View style={[styles.locationCard, marker && styles.locationCardSet]}>
          <Text style={{ fontSize: 22 }}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationStatus}>
              {marker ? "Location set ✓" : "Location not set"}
            </Text>
            <Text style={styles.locationAddress} numberOfLines={2}>
              {marker
                ? (address || `${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}`)
                : "Tap map or use GPS button above"}
            </Text>
            {marker && (
              <Text style={styles.locationCoords}>
                {marker.latitude.toFixed(6)},  {marker.longitude.toFixed(6)}
              </Text>
            )}
          </View>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmBtn, (!marker || saving) && styles.confirmBtnDim]}
          onPress={handleConfirm}
          disabled={!marker || saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>✓  Confirm Location & Continue</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  header: {
    backgroundColor: colors.green,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
  headerSub:   { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3 },

  mapContainer: { flex: 1, position: "relative" },
  map:          { flex: 1 },

  // Custom marker
  markerContainer: { alignItems: "center" },
  markerPin: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.green,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  markerEmoji: { fontSize: 22 },
  markerTail: {
    width: 3, height: 12,
    backgroundColor: colors.green,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },

  // GPS button
  gpsBtn: {
    position: "absolute", top: 14, right: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: "row", alignItems: "center",
    minHeight: 46,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  gpsBtnText: { color: colors.green, fontWeight: "700", fontSize: 13 },

  // Hint banner
  hintBanner: {
    position: "absolute", bottom: 14, left: 14, right: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
    alignItems: "center",
  },
  hintText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // Bottom panel
  panel: {
    backgroundColor: "#fff",
    paddingHorizontal: 16, paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 36 : 18,
    borderTopWidth: 1, borderTopColor: colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 10,
  },

  infoRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  infoCard: {
    flex: 1, backgroundColor: colors.bg,
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  infoLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  infoValue: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 2 },

  locationCard: {
    flexDirection: "row", gap: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10, padding: 12, marginBottom: 12,
    alignItems: "flex-start",
    borderWidth: 1, borderColor: colors.border,
  },
  locationCardSet: {
    backgroundColor: colors.greenPale,
    borderColor: colors.greenMid,
  },
  locationStatus: {
    fontSize: 11, fontWeight: "700", color: colors.textMuted,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3,
  },
  locationAddress: { fontSize: 13, color: colors.text, fontWeight: "500", lineHeight: 18 },
  locationCoords:  {
    fontSize: 10, color: colors.textMuted, marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  confirmBtn: {
    backgroundColor: colors.green,
    borderRadius: 12, paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnDim:  { opacity: 0.5 },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
