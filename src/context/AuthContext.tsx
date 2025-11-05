"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User, LoginCredentials } from "@/types";
import * as authService from "@/lib/services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOGIN_FLAG_COOKIE = "isLoggedIn";

function setLoginFlagCookie() {
  document.cookie = `${LOGIN_FLAG_COOKIE}=true; path=/;`;
}

function deleteLoginFlagCookie() {
  document.cookie = `${LOGIN_FLAG_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUserSession() {
      try {
        const userData = await authService.getMe();
        setLoginFlagCookie();
        setUser(userData);
      } catch (error) {
        await authService.logout();
        deleteLoginFlagCookie();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkUserSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      setLoginFlagCookie();
      router.push("/admin/dashboard");
    } catch (error: any) {
      deleteLoginFlagCookie();
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    deleteLoginFlagCookie();
    router.push("/login");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}