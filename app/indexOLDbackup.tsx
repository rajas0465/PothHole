import { useContext } from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function Index() {
  const authContext = useContext(AuthContext);

  // Ensure that `authContext` is not null
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { user, logout } = authContext;
  const router = useRouter();

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text>Welcome! You are logged in.</Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <>
          <Text>You are not logged in.</Text>
          <Button title="Login" onPress={() => router.push("/(auth)/login")} />
          <Button title="Signup" onPress={() => router.push("/(auth)/signup")} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
