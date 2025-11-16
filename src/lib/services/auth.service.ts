import api from "@/lib/axios";
import type { User, LoginCredentials } from "@/types";

export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    await api.get("/sanctum/csrf-cookie");
    await api.post("/api/auth/login", credentials);
    const user = await getMe();
    return user;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Email atau password salah.");
    }
    console.error("Gagal melakukan login:", error);
    throw new Error("Terjadi masalah, silakan coba lagi nanti.");
  }
}

export async function getMe(): Promise<User> {
  try {
    const response = await api.get("/api/user");
    return response.data;
  } catch (error: any) {
    throw new Error("Gagal mengambil data user.");
  }
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } catch (error) {
    console.error("Gagal logout:", error);
  }
}
