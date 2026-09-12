"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, loginRequest, registerRequest, User } from "@/services/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  updateUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("fpc_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then((currentUser) => {
        window.localStorage.setItem("fpc_user", JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        window.localStorage.removeItem("fpc_token");
        window.localStorage.removeItem("fpc_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (token: string, u: User) => {
    window.localStorage.setItem("fpc_token", token);
    window.localStorage.setItem("fpc_user", JSON.stringify(u));
    setUser(u);
  };

  const updateUser = useCallback((updatedUser: User) => {
    window.localStorage.setItem("fpc_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    persist(data.token, data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await registerRequest(name, email, password);
    persist(data.token, data.user);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem("fpc_token");
    window.localStorage.removeItem("fpc_user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
