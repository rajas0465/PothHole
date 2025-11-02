import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

interface AlertData {
  alert_id: number;
  report_id: number;
  alert_status: string;
  alert_timestamp: string;
  image_url: string;
  description: string;
  latitude: number;
  longitude: number;
  severity_level: string;
  report_status: string;
}

import { BASE_URL } from '@env';

export default function ReportDetailsScreen() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const authContext = useContext(AuthContext);

  if (!authContext) throw new Error("AuthContext must be used within an AuthProvider");
  const { user } = authContext;

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin-alerts`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const { alerts } = response.data;

      const sortedAlerts = alerts.sort((a: AlertData, b: AlertData) => {
        if (a.alert_status === "Unread" && b.alert_status !== "Unread") return -1;
        if (a.alert_status !== "Unread" && b.alert_status === "Unread") return 1;
        return 0;
      });
      setAlerts(sortedAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      Alert.alert("Error", "Could not fetch alerts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const markAlertAsRead = async (alert_id: number) => {
    try {
      await axios.patch(
        `${BASE_URL}/alerts/${alert_id}`,
        { alert_status: "Read" },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setAlerts((prev) =>
        prev.map((a) => (a.alert_id === alert_id ? { ...a, alert_status: "Read" } : a))
      );
    } catch (error) {
      console.error("Error updating alert:", error);
      Alert.alert("Error", "Could not update alert status.");
    }
  };

  const openLocation = (lat: number, lon: number) => {
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lon}`);
  };

  const getSeverityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "#ff4c4c";
      case "medium":
        return "#ffb84d";
      default:
        return "#4caf50";
    }
  };

  const renderAlert = ({ item }: { item: AlertData }) => (
    <View style={styles.card}>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.description}>{item.description}</Text>
          <View
            style={[styles.severityDot, { backgroundColor: getSeverityColor(item.severity_level) }]}
          />
        </View>
        <Text style={styles.details}>Severity: {item.severity_level}</Text>
        <Text style={styles.details}>Status: {item.report_status}</Text>
        <Text style={styles.details}>Alert: {item.alert_status}</Text>
        <Text style={styles.timestamp}>⏱ {item.alert_timestamp}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#1E90FF" }]}
            onPress={() => openLocation(item.latitude, item.longitude)}
          >
            <Text style={styles.buttonText}>📍 View Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  item.alert_status === "Unread" ? "#28a745" : "#555",
              },
            ]}
            onPress={() =>
              item.alert_status === "Unread" && markAlertAsRead(item.alert_id)
            }
            disabled={item.alert_status !== "Unread"}
          >
            <Text style={styles.buttonText}>
              {item.alert_status === "Unread" ? "Mark as Read" : "✔ Read"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>🚧 Admin Alerts</Text> */}
      {loading ? (
        <ActivityIndicator size="large" color="#00ff88" />
      ) : alerts.length > 0 ? (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.alert_id.toString()}
          renderItem={renderAlert}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noData}>No alerts found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 16,
  },
  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  details: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 4,
  },
  timestamp: {
    color: "#888",
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  noData: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
