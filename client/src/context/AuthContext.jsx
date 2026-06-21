import { createContext, useState, useEffect, useContext } from "react";
import { getProfile, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const profile = await getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("AuthContext: profile fetch failed", error);
      // If unauthorized, clean up token
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    return await fetchUser();
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Failed server-side logout:", e);
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    return await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
