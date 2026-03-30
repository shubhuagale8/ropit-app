import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

import BasicInfoScreen    from "../screens/auth/BasicInfoScreen";
import OTPVerifyScreen    from "../screens/auth/OTPVerifyScreen";
import LocationMapScreen  from "../screens/auth/LocationMapScreen";
import DashboardScreen    from "../screens/main/DashboardScreen";
import StockScreen        from "../screens/main/StockScreen";
import AddEditPlantScreen from "../screens/main/AddEditPlantScreen";
import EnquiriesScreen    from "../screens/main/EnquiriesScreen";
import BookingsScreen     from "../screens/main/BookingsScreen";
import ProfileScreen      from "../screens/main/ProfileScreen";

const Root = createNativeStackNavigator();
const Auth = createNativeStackNavigator();
const Main = createNativeStackNavigator();
const Tab  = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor:  colors.border,
          paddingBottom: 6,
          paddingTop:    6,
          height:        62,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarIcon: ({ focused }) => {
          const map = {
            Home:      focused ? "🏠" : "🏡",
            Stock:     focused ? "🌱" : "🌿",
            Bookings:  focused ? "📅" : "🗓️",
            Enquiries: focused ? "📩" : "📨",
            Profile:   focused ? "👤" : "🧑",
          };
          return <Text style={{ fontSize: 22 }}>{map[route.name] || "●"}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home"      component={DashboardScreen} />
      <Tab.Screen name="Stock"     component={StockScreen} />
      <Tab.Screen name="Bookings"  component={BookingsScreen} />
      <Tab.Screen name="Enquiries" component={EnquiriesScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Main.Navigator screenOptions={{ headerShown: false }}>
      <Main.Screen name="Tabs"      component={Tabs} />
      <Main.Screen name="AddPlant"  component={AddEditPlantScreen} options={{ presentation: "modal" }} />
      <Main.Screen name="EditPlant" component={AddEditPlantScreen} options={{ presentation: "modal" }} />
    </Main.Navigator>
  );
}

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="BasicInfo"   component={BasicInfoScreen} />
      <Auth.Screen name="OTPVerify"   component={OTPVerifyScreen} />
      <Auth.Screen name="LocationMap" component={LocationMapScreen} />
    </Auth.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>🌿</Text>
        <Text style={styles.splashText}>Ropit</Text>
        <ActivityIndicator color="#fff" size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/*
        We always register both "Main" and "Auth" as root screens.
        This ensures navigation.replace("Main") and navigation.replace("Auth")
        always work from any screen including LocationMap.
      */}
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Root.Screen name="Main" component={MainStack} />
        ) : (
          <Root.Screen name="Auth" component={AuthStack} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  splashEmoji: { fontSize: 60 },
  splashText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginTop: 8,
    letterSpacing: 1,
  },
});
