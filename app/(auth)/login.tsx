import React, { useState, useContext, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { AuthContext } from "../../contexts/AuthContext";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
import { BASE_URL } from '@env';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [moveAnim] = useState(new Animated.Value(50));
  const [pulse] = useState(new Animated.Value(0));

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { login } = authContext;
  const router = useRouter();

  // Disable hardware back button (Android)
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true; // returning true disables back
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => subscription.remove();
    }, [])
  );

  // Animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.circle),
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Invalid email or password.");
      const data = await response.json();

      if (data.token && data.userId && data.role) {
        login(data.token, data.userId, data.role);
        router.replace(data.role === "admin" ? "/(admin)" : "/(user)");
      } else {
        Alert.alert("Login Error", "Invalid server response.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Animated scale value for pulse
  const scale1 = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const opacity1 = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  return (
    <LinearGradient colors={["#1c1c1c", "#2c2c54", "#0f0f0f"]} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Pulsating background circle animation */}
        <View style={styles.pulseContainer}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [{ scale: scale1 }],
                opacity: opacity1,
              },
            ]}
          >
            <Svg height={400} width={400}>
              <Circle cx={200} cy={200} r={100} stroke="#6a5acd" strokeWidth={1.5} fill="none" />
            </Svg>
          </Animated.View>
        </View>

        {/* Animated logo and title */}
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fadeAnim, transform: [{ translateY: moveAnim }] },
          ]}
        >
          <Image
            source={require("../../assets/PotholeLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Pothole Risk Predictor</Text>
        </Animated.View>

        {/* Login form */}
        <Animated.View
          style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: moveAnim }] }]}
        >
          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerContainer}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text style={styles.registerText}>Don’t have an account?</Text>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pulseContainer: {
    position: "absolute",
    top: height / 3.5,
    alignSelf: "center",
    zIndex: 0,
  },
  circle: {
    position: "absolute",
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
    zIndex: 10,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 10,
  },
  appTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  loginButton: {
    backgroundColor: "#6a5acd",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#bbb",
    marginBottom: 5,
  },
  registerLink: {
    color: "#6a5acd",
    fontWeight: "bold",
  },
});
