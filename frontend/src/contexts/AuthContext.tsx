import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, AuthResponse } from "@/types/auth";

// Helper to decode JWT and check expiration
function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const [, payload] = token.split(".");
    if (!payload) return false;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (!decoded.exp) return false;
    // exp is in seconds, Date.now() in ms
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token and user data on mount
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData && isTokenValid(token)) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = (response: AuthResponse) => {
    const { accessToken, ...userData } = response;
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
