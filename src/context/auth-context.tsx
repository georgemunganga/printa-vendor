import React, { createContext, useContext, useMemo, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  memberSince: string;
  rating?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const INITIAL_USER: AuthUser = {
  id: "user-1",
  name: "George Parker",
  email: "george@printa.com",
  phone: "+1 (555) 123-4567",
  memberSince: "January 2024",
  rating: 4.9,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(INITIAL_USER));

  const login = (nextUser: AuthUser) => {
    setUser(nextUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout, updateUser }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
