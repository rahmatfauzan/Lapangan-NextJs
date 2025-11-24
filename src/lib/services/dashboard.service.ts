import api from "@/lib/axios";
import type { DashboardStats, Booking, UpcomingMabar } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await api.get("/api/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil stats:", error);
    throw new Error("Gagal mengambil stats dashboard.");
  }
}

export async function getRecentBookings(): Promise<Booking[]> {
  try {
    const response = await api.get("/api/admin/dashboard/recent-bookings");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil booking:", error);
    throw new Error("Gagal mengambil data booking.");
  }
}

export async function getUpcomingMabar(): Promise<UpcomingMabar[]> {
  try {
    const response = await api.get("/api/admin/dashboard/upcoming-mabar");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil event:", error);
    throw new Error("Gagal mengambil data event.");
  }
}
