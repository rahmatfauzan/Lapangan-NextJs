import { PaginatedResponse, SportCategory } from "@/types";
import api from "../axios";

interface CategoryFormData {
  name: string;
  icon: string;
}

// lib/services/category.service.ts
export const categoryFetcher = async (
  url: string // url akan berisi: /api/admin/sport-categories?page=1&name=...
): Promise<PaginatedResponse<SportCategory>> => {
  // <-- Kembalikan PaginatedResponse
  try {
    const response = await api.get(url);
    console.log(response.data);
    return response.data; // (Asumsi backend-mu sudah pakai .paginate())
  } catch (error: any) {
    console.error("Gagal mengambil daftar kategori:", error);
    throw new Error("Gagal mengambil data kategori.");
  }
};

export const categoryFetchernoPaginate = async (
  url: string // Asumsi ini adalah URL dasar: /api/admin/sport-categories
): Promise<SportCategory[]> => {
  try {
    const allCategories: SportCategory[] = [];
    let currentPage = 1;
    const separator = url.includes("?") ? "&" : "?";
    while (true) {
      const response = await api.get(`${url}${separator}page=${currentPage}`);
      const paginatedData = response.data;
      allCategories.push(...paginatedData.data);

      if (currentPage >= paginatedData.meta.last_page) {
        break;
      }

      currentPage++;
    }

    return allCategories;
  } catch (error: any) {
    console.error("Gagal mengambil daftar kategori:", error);
    throw new Error("Gagal mengambil data kategori.");
  }
};

export async function createCategory(
  data: CategoryFormData
): Promise<SportCategory> {
  try {
    // Kirim sebagai JSON biasa
    const response = await api.post("/api/admin/sport-categories", data);
    return response.data.data; // Asumsi dibungkus Resource
  } catch (error: any) {
    console.error("Gagal membuat kategori:", error);
    throw error; // Lempar error (termasuk validasi)
  }
}

/**
 * [ADMIN] Mengupdate kategori
 */
export async function updateCategory(
  id: number,
  data: CategoryFormData
): Promise<SportCategory> {
  try {
    // Gunakan 'PUT' karena kita mengirim JSON (bukan FormData)
    const response = await api.put(`/api/admin/sport-categories/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Gagal update kategori:", error);
    throw error;
  }
}

/**
 * [ADMIN] Menghapus kategori
 */
export async function deleteCategory(id: number): Promise<void> {
  try {
    await api.delete(`/api/admin/sport-categories/${id}`);
  } catch (error: any) {
    console.error("Gagal menghapus kategori:", error);
    throw new Error("Gagal menghapus kategori.");
  }
}
