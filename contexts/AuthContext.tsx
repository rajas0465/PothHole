import React, { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: { token: string; userId: string; role: string } | null;
  login: (token: string, userId: string, role: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const [loading, setLoading] = useState(true);

useEffect(() => {
  // Load user from AsyncStorage or token check
  async function loadUser() {
    const savedUser = await AsyncStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }
  loadUser();
}, []);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    };
    loadUser();
  }, []);

  const login = async (token: string, userId: string, role: string) => {
    const userData = { token, userId, role };

    // Store the user as a string
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Simulate delay for demonstration (optional)
      console.log("Starting logout process...");
      await AsyncStorage.removeItem("user");
      console.log("User data removed from storage.");
      // Clear user state (assuming you have a setUser function)
      setUser(null);
      console.log("User state cleared.");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
