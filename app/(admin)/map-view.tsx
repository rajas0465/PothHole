import React, { useState, useEffect, useContext, useRef } from "react";
import { 
  StyleSheet, View, ActivityIndicator, Alert, Animated, Text 
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

import { BASE_URL } from '@env';

type LocationData = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
};

type AlertData = {
  alert_id: number;
  latitude: number;
  longitude: number;
  description: string;
  severity_level: string;
};

const AdminMapView = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [adminAlerts, setAdminAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  if (!authContext) {
    throw new Error("AuthContext is not available. Wrap with AuthProvider.");
  }

  const { user } = authContext;

  // 🌀 Pulse Animation Effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 📡 Fetch admin location and nearby alerts
  useEffect(() => {
    if (!user || !user.userId) {
      Alert.alert("Error", "User not authenticated");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const locationResponse = await axios.get<LocationData>(
          `${BASE_URL}/user/${user.userId}/location`
        );
        setLocationData(locationResponse.data);

        const alertsResponse = await axios.get<{ alerts: AlertData[] }>(
          `${BASE_URL}/admin-alerts-get-locations`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        setAdminAlerts(alertsResponse.data.alerts || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch location or alerts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C4FF" />
        <Text style={styles.loadingText}>Loading Map Data...</Text>
      </View>
    );
  }

  if (!locationData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ No location data available</Text>
      </View>
    );
  }

  const { latitude, longitude, radius, name } = locationData;

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <View style={styles.container}>
      {/* 🌍 Map Section */}
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: radius / 30,
          longitudeDelta: radius / 30,
        }}
        customMapStyle={darkMapStyle}
      >
        {/* 🔵 Admin Marker + Animated Pulse */}
        <Marker
          coordinate={{ latitude, longitude }}
          title={name}
          description={`Admin area radius: ${radius} km`}
          pinColor="cyan"
        />
        <Circle
          center={{ latitude, longitude }}
          radius={radius * 1000}
          strokeWidth={2}
          strokeColor="rgba(0, 255, 255, 0.8)"
          fillColor="rgba(0, 255, 255, 0.2)"
        />

        {/* Pulse Animation Layer */}
        <Animated.View
          style={{
            position: "absolute",
            top: "45%",
            left: "45%",
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: "rgba(0, 255, 255, 0.3)",
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          }}
        />

        {/* 🚨 Admin Alerts Markers */}
        {adminAlerts.map((alert) => (
          <Marker
            key={alert.alert_id}
            coordinate={{
              latitude: alert.latitude,
              longitude: alert.longitude,
            }}
            title={alert.description}
            description={`Severity: ${alert.severity_level}`}
            pinColor={
              alert.severity_level.toLowerCase() === "high"
                ? "red"
                : alert.severity_level.toLowerCase() === "medium"
                ? "orange"
                : "green"
            }
          />
        ))}
      </MapView>

      {/* 🔰 Legend Overlay */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>🧭 Severity Levels</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "red" }]} />
          <Text style={styles.legendText}>High Risk</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "orange" }]} />
          <Text style={styles.legendText}>Medium Risk</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "green" }]} />
          <Text style={styles.legendText}>Low Risk</Text>
        </View>
      </View>
    </View>
  );
};

export default AdminMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  errorText: {
    color: "#f87171",
    fontSize: 16,
  },
  legendContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 10,
    padding: 12,
    elevation: 5,
  },
  legendTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: "#e2e8f0",
    fontSize: 14,
  },
});

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];
