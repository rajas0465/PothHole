import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from '@env';


interface AlertType {
  alert_id: number;
  report_id: number;
  description: string;
  latitude: number;
  longitude: number;
  severity_level: string;
  alert_timestamp: string;
}



export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useContext(AuthContext) || { user: null };
  const [latestAlerts, setLatestAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch top 3 recent alerts from API
  const fetchRecentAlerts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin-alerts`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const { alerts } = response.data;
      if (alerts && alerts.length > 0) {
        const sorted = alerts
          .sort(
            (a: AlertType, b: AlertType) =>
              new Date(b.alert_timestamp).getTime() -
              new Date(a.alert_timestamp).getTime()
          )
          .slice(0, 3); // ✅ Take top 3 recent alerts
        setLatestAlerts(sorted);
      } else {
        setLatestAlerts([]);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      Alert.alert("Error", "Could not fetch recent alerts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchRecentAlerts();
  }, []);

  const handleAlertClick = (alert: AlertType) => {
    Alert.alert(
      "Alert Details",
      `Report ID: ${alert.report_id}\nDescription: ${alert.description}\nSeverity: ${alert.severity_level}`,
      [{ text: "View Details", onPress: () => router.push("./(admin)/report-details") }]
    );
  };

  if (!user || user.role !== "admin") {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>You are not authorized to view this page.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1E3C72", "#2A5298"]} style={styles.header}>
        <Text style={styles.title}>Pothole Risk Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, Admin 👷‍♂️</Text>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("./(admin)/map-view")}
        >
          <Ionicons name="map-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>View Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("./(admin)/report-details")}
        >
          <Ionicons name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>View Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Alerts Section */}
      <Text style={styles.alertTitle}>Recent Alerts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00ff88" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={latestAlerts}
          keyExtractor={(item) => item.alert_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.alertItem,
                item.severity_level === "High" || item.severity_level.toLowerCase() === "major_pothole"
                  ? styles.highSeverity
                  : item.severity_level === "Medium" || item.severity_level.toLowerCase() === "minor_pothole"
                  ? styles.mediumSeverity
                  : styles.lowSeverity,
              ]}
              onPress={() => handleAlertClick(item)}
            >
              <View>
                <Text style={styles.alertText}>🚧 {item.description}</Text>
                <Text style={styles.severityText}>
                  Severity: {item.severity_level} • {new Date(item.alert_timestamp).toLocaleString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.noAlertsText}>No recent alerts found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  header: {
    paddingVertical: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#E0E0E0",
    marginTop: 5,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 15,
    width: "42%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
    fontSize: 14,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  alertItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  alertText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  severityText: {
    color: "#E2E8F0",
    fontSize: 14,
    marginTop: 4,
  },
  highSeverity: {
    backgroundColor: "#DC2626",
  },
  mediumSeverity: {
    backgroundColor: "#F59E0B",
  },
  lowSeverity: {
    backgroundColor: "#16A34A",
  },
  noAlertsText: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
});
