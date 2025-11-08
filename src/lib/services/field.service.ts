// lib/services/field.service.ts

import api from "@/lib/axios";
import type {
  DayHour,
  Field,
  FieldBlock,
  FieldOperatingHours,
  PaginatedResponse,
} from "@/types";
import { Console } from "console";

/**
 * (1) FETCHER UNTUK SWR
 * SWR akan memanggil ini dengan URL lengkap (termasuk filter/page)
 */
export const fieldFetcher = async (
  url: string // cth: /api/admin/fields?page=1&status=active&name=futsal
): Promise<PaginatedResponse<Field>> => {
  try {
    // Langsung panggil 'url' yang sudah berisi semua parameter
    const response = await api.get(url);
    // console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Gagal mengambil daftar lapangan:", error);
    throw new Error("Gagal mengambil data lapangan.");
  }
};

export async function createField(data: FormData): Promise<Field> {
  try {
    const response = await api.post("/api/admin/fields", data, {
      headers: {
        // Pastikan header di-set untuk FormData
        "Content-Type": "multipart/form-data",
      },
    });
    // Asumsi backend mengembalikan data Field (dibungkus Resource)
    return response.data;
  } catch (error: any) {
    console.error("Gagal membuat lapangan:", error);
    // Lempar error agar form bisa menangkapnya
    throw error;
  }
}

export async function updateField(id: number, data: FormData): Promise<Field> {
  try {
    // Gunakan POST + _method: 'PUT'
    const response = await api.post(`/api/admin/fields/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data; // Asumsi Resource dibungkus 'data'
  } catch (error: any) {
    console.error("Gagal update lapangan:", error);
    throw error; // Lempar error agar form bisa menangani
  }
}

/**
 * (3) FUNGSI DELETE (dipanggil oleh Halaman)
 */
export async function deleteField(id: number): Promise<void> {
  try {
    await api.delete(`/api/admin/fields/${id}`);
  } catch (error: any) {
    console.error("Gagal menghapus lapangan:", error);
    throw new Error("Gagal menghapus data lapangan.");
  }
}

export const hoursFetcher = async (
  url: string
): Promise<FieldOperatingHours[]> => {
  try {
    const response = await api.get(url);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("Gagal mengambil jam operasional:", error);
    throw new Error("Gagal mengambil data jam operasional.");
  }
};

/**
 * [ADMIN] Mengupdate jam operasional
 */
export async function updateFieldHours(
  fieldId: number,
  hoursData: DayHour[]
): Promise<any> {
  try {
    // API endpoint-nya adalah PUT /api/admin/fields/{id}/operating-hours
    const response = await api.put(
      `/api/admin/fields/${fieldId}/operating-hours`,
      {
        hours: hoursData, // Kirim data dalam format { hours: [...] }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Gagal mengupdate jam operasional:", error);
    throw error; // Lempar error agar form bisa menangkapnya
  }
}

export const blocksFetcher = async (url: string): Promise<FieldBlock[]> => {
  try {
    const response = await api.get(url);
    return response.data.data || response.data; // (Tergantung Resource kamu)
  } catch (error: any) {
    console.error("Gagal mengambil jadwal blokir:", error);
    throw new Error("Gagal mengambil data blokir.");
  }
};

/**
 * [ADMIN] Membuat jadwal blokir baru
 */
export async function createFieldBlock(
  fieldId: number,
  data: {
    reason: string;
    start_datetime: string; // ISO String (YYYY-MM-DD HH:MM:SS)
    end_datetime: string;
  }
): Promise<FieldBlock> {
  try {
    const response = await api.post(
      `/api/admin/fields/${fieldId}/blocks`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Gagal membuat jadwal blokir:", error);
    throw error;
  }
}

export async function deleteFieldBlock(blockId: number): Promise<void> {
  try {
    // Panggil API DELETE /api/admin/blocks/{fieldBlock}
    await api.delete(`/api/admin/blocks/${blockId}`);
  } catch (error: any) {
    console.error("Gagal menghapus jadwal blokir:", error);
    throw new Error("Gagal menghapus jadwal blokir.");
  }
}

export interface Slot {
  time: string; // "HH:MM"
  is_available: boolean;
  reason: string | null;
}

/**
 * [PUBLIK] Mengambil ketersediaan slot
 * Rute: GET /api/fields/{id}/availability?date=YYYY-MM-DD
 */
export const availabilityFetcher = async ({
  fieldId,
  date,
}: {
  fieldId: string;
  date: string;
}): Promise<Slot[]> => {
  if (!fieldId || !date) return [];
  try {
    const response = await api.get(
      `/api/fields/${fieldId}/availability?date=${date}`
    );
    return response.data; // Backend mengembalikan array slot
  } catch (error: any) {
    console.error("Gagal mengambil ketersediaan slot:", error);
    throw new Error("Gagal mengambil ketersediaan slot.");
  }
};
