// lib/services/mabar.service.ts

import api from "@/lib/axios";
import type { MabarSession, PaginatedResponse, Booking, Field } from "@/types";

/**
 * Fetcher untuk SWR (Mengambil semua sesi mabar publik)
 * Rute: GET /api/mabar-sessions
 */
export const mabarFetcher = async (
  url: string
): Promise<PaginatedResponse<MabarSession>> => {
  try {
    const response = await api.get(url);
    return response.data; // (Backend sudah mengembalikan data paginasi)
  } catch (error: any) {
    console.error("Gagal mengambil sesi mabar:", error);
    throw new Error("Gagal mengambil data sesi mabar.");
  }
};

export const allFieldsFetcher = async (url: string): Promise<Field[]> => {
  try {
    const response = await api.get(url);
    // Asumsi API publik mengembalikan array Field (setelah Resource Collection)
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("Gagal mengambil daftar lapangan:", error);
    throw new Error("Gagal mengambil daftar lapangan.");
  }
};

/**
 * Mengambil detail satu sesi mabar
 * Rute: GET /api/mabar-sessions/{id}
 */
export const getMabarSession = async (
  id: string | number
): Promise<MabarSession> => {
  try {
    const response = await api.get(`/api/mabar-sessions/${id}`);
    return response.data.data; // (Dibungkus oleh Resource)
  } catch (error: any) {
    console.error("Gagal mengambil detail sesi mabar:", error);
    throw new Error("Gagal mengambil detail data.");
  }
};

/**
 * Membuat sesi mabar baru (Perlu Login)
 * Rute: POST /api/mabar-sessions
 */
export async function createMabarSession(
  data: FormData // Kita pakai FormData karena ada 'cover_image'
): Promise<{ mabar_session: MabarSession; booking_to_pay: Booking }> {
  try {
    const dataObject = Object.fromEntries(data.entries());
    console.log(dataObject);
    const response = await api.post("/api/mabar-sessions", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Backend mengembalikan 2 objek: sesi mabar & booking yg harus dibayar
    return response.data;
  } catch (error: any) {
    console.error("Gagal membuat sesi mabar:", error);
    throw error; // Lempar error (termasuk validasi)
  }
}

/**
 * Bergabung ke sesi mabar (Perlu Login)
 * Rute: POST /api/mabar-sessions/{id}/join
 */
export async function joinMabarSession(id: number | string): Promise<any> {
  try {
    // (Backend akan merespon dengan data partisipan atau pesan sukses)
    const response = await api.post(`/api/mabar-sessions/${id}/join`);
    return response.data;
  } catch (error: any) {
    console.error("Gagal bergabung ke sesi mabar:", error);
    throw error;
  }
}
