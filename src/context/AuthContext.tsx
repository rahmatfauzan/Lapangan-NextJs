"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User, LoginCredentials } from "@/types";
import * as authService from "@/lib/services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userRole: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUserSession() {
      try {
        const isLoggedIn = getCookie("isLoggedIn");
        const role = getCookie("user_role");
        
        console.log('Auth check:', { isLoggedIn, role }); // Debug log
        
        if (!isLoggedIn || !role) {
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        const userData = await authService.getMe();
        setUser(userData);
        setUserRole(role);
        
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
        setUserRole(null);
        await authService.logout().catch(() => {});
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
      
      // Baca role dari cookie
      const role = getCookie("user_role");
      setUserRole(role);
      
      console.log('Login successful, role:', role); // Debug log
      
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
      
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setUserRole(null);
      router.push("/login");
      router.refresh();
    }
  };

  const value = {
    user,
    isLoading,
    userRole,
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