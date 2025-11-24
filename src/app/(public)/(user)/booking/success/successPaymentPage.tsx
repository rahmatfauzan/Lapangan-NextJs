"use client";

import { useEffect, useState, Suspense } from "react"; // 1. Tambah import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

// 2. Ubah nama fungsi utama menjadi BookingSuccessContent
function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const invoice = searchParams.get("invoice");
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBooking = async () => {
      if (!invoice) {
        setError("Invoice tidak ditemukan");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch booking data
        const response = await api.get(`api/bookings/invoice/${invoice}`);
        if (response.data.data.status === "active") {
          setBooking(response.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching booking:", error);
        setError("Gagal memuat data booking");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [invoice, router]); // Tambahkan router ke dependency array

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Pembayaran Berhasil!
        </h1>
        <p className="text-gray-600 mb-6">
          Terima kasih, booking Anda telah dikonfirmasi.
        </p>

        {booking ? (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
              <p className="font-bold text-gray-900">
                {booking.invoice_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p
                className={`font-bold capitalize ${
                  booking.status === "active"
                    ? "text-green-600"
                    : booking.status === "pending"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {booking.status === "active" ? "✅ Aktif" : booking.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Lapangan</p>
              <p className="font-semibold text-gray-900">
                {booking.field?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tanggal</p>
              <p className="font-semibold text-gray-900">
                {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Waktu</p>
              <div className="flex flex-wrap gap-1">
                {booking.booked_slots?.map((slot: string, index: number) => (
                  <span
                    key={index}
                    className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
              <p className="text-xl font-bold text-orange-600">
                Rp {booking.price?.toLocaleString("id-ID") || "0"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-500">Data booking tidak ditemukan</p>
          </div>
        )}

        <button
          onClick={() =>
            (window.location.href = `/booking/${booking?.invoice_number}`)
          }
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition mb-2"
        >
          Lihat Detail Booking
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
