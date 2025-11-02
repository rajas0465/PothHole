import React, { useState, useContext, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { BASE_URL } from '@env';

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [radius, setRadius] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("AuthContext must be used within an AuthProvider");
  const { login } = authContext;

    // Disable hardware back button (Android)
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => true; // returning true disables back
        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
  
        return () => subscription.remove();
      }, [])
    );
  

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      Alert.alert("✅ Location Captured", "Your current location has been captured.");
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not fetch location. Please try again.");
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Fields", "Name, email, and password are required.");
      return;
    }

    if (role === "admin" && (!latitude || !longitude || !radius)) {
      Alert.alert("Missing Fields", "Please fill location and radius details for admin.");
      return;
    }

    try {
      setLoading(true);
      let locationAreaId = null;

      if (role === "admin") {
        const geoAreaResponse = await fetch(`${BASE_URL}/geographical-areas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `Admin Area for ${email}`,
            latitude: parseFloat(latitude!),
            longitude: parseFloat(longitude!),
            radius: parseFloat(radius),
          }),
        });

        if (!geoAreaResponse.ok) throw new Error("Failed to create geographical area.");
        const geoAreaData = await geoAreaResponse.json();
        locationAreaId = geoAreaData.id;
      }

      const userResponse = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          location_area: locationAreaId,
        }),
      });

      const userData = await userResponse.json();
      if (!userResponse.ok) {
        throw new Error(userData.message || "Failed to register. Please try again.");
      }

      if (userData.token && userData.id && userData.role) {
        login(userData.token, userData.id, userData.role);
        router.replace(userData.role === "admin" ? "/(admin)" : "/(user)");
      } else {
        Alert.alert("Success", "Account created successfully. Please log in.");
        router.push("/(auth)/login");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Signup Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the mission to make roads safer 🚗✨</Text>

            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#aaa"
            />

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#aaa"
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Select Role</Text>
            <Picker
              selectedValue={role}
              onValueChange={(value) => setRole(value)}
              style={styles.picker}
              dropdownIconColor="#00e0ff"
            >
              <Picker.Item label="User" value="user" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>

            {role === "admin" && (
              <>
                <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
                  <Text style={styles.locationButtonText}>
                    {latitude ? "📍 Location Captured" : "Get Current Location"}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  placeholder="Latitude"
                  value={latitude || ""}
                  onChangeText={setLatitude}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  placeholder="Longitude"
                  value={longitude || ""}
                  onChangeText={setLongitude}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  placeholder="Radius (in km)"
                  value={radius}
                  onChangeText={setRadius}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
              </>
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#00e0ff" style={{ marginTop: 20 }} />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <LinearGradient
                  colors={["#00c6ff", "#0072ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Register</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 16 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#bbb",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1f1f2e",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  label: { color: "#fff", fontWeight: "600", marginBottom: 8 },
  picker: {
    backgroundColor: "#1f1f2e",
    color: "#fff",
    borderRadius: 10,
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: "#2a2a3d",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  locationButtonText: { color: "#00e0ff", fontWeight: "bold" },
  button: { marginTop: 15 },
  buttonGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
