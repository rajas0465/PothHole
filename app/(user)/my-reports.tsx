import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
  Linking,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../../contexts/AuthContext";

interface Report {
  id: number;
  user_id: number;
  image_url: string;
  description: string;
  latitude: number;
  longitude: number;
  severity_level: string;
  status: string;
  created_at: string;
}

import { BASE_URL } from '@env';

export default function MyReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("AuthContext must be used within an AuthProvider");

  const { user } = authContext;

  useEffect(() => {
    fetchReports();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.circle),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/my-reports`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

       // ✅ Sort reports by latest date first
    const sortedReports = response.data.sort(
      (a: Report, b: Report) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
      setReports(sortedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Could not fetch your reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openLocationInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the location. Please try again.")
    );
  };

  const renderSeverityBadge = (level: string) => {
    let color = "#00ff88";
    if (level.toLowerCase() === "medium" || level.toLowerCase() === "minor_pothole") color = "#f0ad4e";
    else if (level.toLowerCase() === "high" || level.toLowerCase() === "major_pothole") color = "#ff4d4d";

    return (
      <View style={[styles.badge, { backgroundColor: color + "33", borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{level.toUpperCase()}</Text>
      </View>
    );
  };

  const renderReport = ({ item }: { item: Report }) => (
    <Animated.View
      style={[
        styles.reportContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
      )}
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.infoRow}>
        {renderSeverityBadge(item.severity_level)}
        <Text style={styles.status}>{item.status}</Text>
      </View>

      <Text style={styles.dateText}>
        🕒 {new Date(item.created_at).toLocaleString()}
      </Text>

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => openLocationInMaps(item.latitude, item.longitude)}
      >
        <Text style={styles.mapButtonText}>📍 Open in Maps</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={["#1c1c1c", "#2c2c54", "#0f0f0f"]} style={styles.container}>
      {/* <Text style={styles.title}>My Reports</Text> */}

      {loading ? (
        <ActivityIndicator size="large" color="#6a5acd" style={{ marginTop: 30 }} />
      ) : reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReport}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      ) : (
        <Text style={styles.noReportsText}>No reports found.</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
    textShadowColor: "#6a5acd",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  reportContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#6a5acd",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    color: "#bbb",
  },
  dateText: {
    color: "#888",
    fontSize: 13,
    marginBottom: 10,
  },
  mapButton: {
    backgroundColor: "#6a5acd",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  noReportsText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
    marginTop: 30,
  },
});
