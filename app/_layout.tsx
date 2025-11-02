import { Stack, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { AuthProvider, AuthContext } from "../contexts/AuthContext";
import { Button, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, Image, Text } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RoleBasedNavigator />
    </AuthProvider>
  );
}

function RoleBasedNavigator() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { user, logout, loading } = authContext;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 🚀 Handle redirection once the auth state is known
  useEffect(() => {
    if (loading) return; // Prevent premature redirect while loading

    if (!user) {
      router.replace("/login");
    } else if (user.role === "admin") {
      router.replace("/(admin)");
    } else {
      router.replace("/(user)");
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/login");
      //router.dismissAll(); 
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#6200ee" },
        headerTintColor: "#fff",
        headerRight: () =>
          isLoggingOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            user && <Button title="Logout" onPress={handleLogout} />
          ),
      }}
    >
      {/* Hide header on auth screens */}
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />

      {/* Protected areas */}
      <Stack.Screen
        name="(user)/index"
        options={{
          title: "User Dashboard",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#1a1a2e",
          } as any, // 👈 allow shadowColor safely
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
            letterSpacing: 1, // 👈 TypeScript-safe with "as any"
            textShadowColor: "#6a5acd",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          } as any,
          headerBackground: () => (
            <LinearGradient
              colors={["#2c2c54", "#1c1c1c"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ),
        }}
      />
           <Stack.Screen
        name="(user)/my-reports"
        options={{
          title: "My Reports",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#1a1a2e",
          } as any, // 👈 allow shadowColor safely
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
            letterSpacing: 1, // 👈 TypeScript-safe with "as any"
            textShadowColor: "#6a5acd",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          } as any,
          headerBackground: () => (
            <LinearGradient
              colors={["#2c2c54", "#1c1c1c"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ),
        }}
      />

      <Stack.Screen name="(user)/report-submission" options={{ title: "Submit Report" }} />
      
      {/* <Stack.Screen name="(admin)/index" options={{ title: "Admin Dashboard" }} /> */}
                 <Stack.Screen
        name="(admin)/index"
        options={{
          title: "Admin Dashboard",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#1a1a2e",
          } as any, // 👈 allow shadowColor safely
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
            letterSpacing: 1, // 👈 TypeScript-safe with "as any"
            textShadowColor: "#6a5acd",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          } as any,
          headerBackground: () => (
            <LinearGradient
              colors={["#2c2c54", "#1c1c1c"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ),
        }}
      />
     <Stack.Screen
        name="(admin)/map-view"
        options={{
          title: "Pothole Map",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#1a1a2e",
          } as any, // 👈 allow shadowColor safely
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
            letterSpacing: 1, // 👈 TypeScript-safe with "as any"
            textShadowColor: "#6a5acd",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          } as any,
          headerBackground: () => (
            <LinearGradient
              colors={["#2c2c54", "#1c1c1c"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ),
        }}
      />
      <Stack.Screen name="(admin)/report-details" options={{ title: "Report Details" }} />
    </Stack>
  );
}
