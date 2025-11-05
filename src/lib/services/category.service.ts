import { SportCategory } from "@/types";
import api from "../axios";

export const categoryFetcher = async (
  url: string // cth: /api/sport-categories
): Promise<SportCategory[]> => {
  try {
    const response = await api.get(url);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("Gagal mengambil daftar kategori:", error);
    throw new Error("Gagal mengambil data kategori.");
  }
};
