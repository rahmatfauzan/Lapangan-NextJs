// lib/services/user.service.ts

import api from "@/lib/axios";
import type { User, PaginatedResponse } from "@/types";

// Interface untuk data yang akan dikirim saat update
interface UserUpdateData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role_id: number; // ID peran baru (untuk update role)
}

/**
 * [ADMIN] Fetcher untuk SWR (Mengambil daftar pengguna dengan paginasi)
 */
export const userFetcher = async (
  url: string
): Promise<PaginatedResponse<User>> => {
  try {
    const response = await api.get(url);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Gagal mengambil daftar pengguna:", error);
    throw new Error("Gagal mengambil daftar pengguna.");
  }
};

/**
 * [ADMIN] Mengupdate pengguna
 * Rute: PUT /api/admin/users/{id}
 */
export async function updateUser(
  id: number,
  data: UserUpdateData
): Promise<User> {
  try {
    // Kirim sebagai JSON biasa menggunakan PUT
    const response = await api.put(`/api/admin/users/${id}`, data);
    return response.data.data; // Asumsi backend mengembalikan User Resource
  } catch (error: any) {
    console.error(`Gagal mengupdate user ID ${id}:`, error);
    throw error;
  }
}

/**
 * [ADMIN] Menghapus pengguna
 * Rute: DELETE /api/admin/users/{id}
 */
export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/api/admin/users/${id}`);
  } catch (error: any) {
    console.error(`Gagal menghapus user ID ${id}:`, error);
    throw error;
  }
}

// lib/services/user.service.ts

// Interface untuk data yang akan dikirim saat create/update
interface UserFormInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role_id: number;
  // Anda mungkin perlu password saat CREATE
  password?: string;
  password_confirmation?: string;
}

// ... (userFetcher, updateUser, deleteUser sudah ada) ...

/**
 * [ADMIN] Membuat pengguna baru
 * Rute: POST /api/admin/users
 */
export async function createUser(data: UserFormInput): Promise<User> {
  try {
    const response = await api.post("/api/admin/users", data);
    return response.data.data;
  } catch (error: any) {
    console.error("Gagal membuat user baru:", error);
    throw error;
  }
}
