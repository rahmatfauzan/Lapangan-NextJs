import { Booking, MabarSession, PaginatedResponse } from "@/types";
import api from "../axios";
import { log } from "console";

interface AdminBookingRequestData {
  field_id: string;
  booking_date: string;
  booked_slots: string[];
  name_orders: string;
  phone_orders: string;
  payment_gateway: string;
  user_id?: number;
}

export const bookingFetcher = async (
  url: string
): Promise<PaginatedResponse<Booking>> => {
  try {
    const response = await api.get(url);
    console.log(response.data);
    // Backend sudah mengembalikan data paginasi
    return response.data;
  } catch (error: any) {
    console.error("Gagal mengambil sesi mabar:", error);
    throw new Error("Gagal mengambil data sesi mabar.");
  }
};

export async function createAdminBooking(
  data: AdminBookingRequestData
): Promise<Booking> {
  try {
    // Kirim sebagai JSON
    console.log(data);
    const response = await api.post("/api/admin/manual-booking", data);
    console.log(response.data);
    return response.data; // Asumsi backend mengembalikan Booking Resource
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}
