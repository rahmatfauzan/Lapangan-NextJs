"use client";

import { useEffect, useState, useCallback, Suspense } from "react"; // 1. Tambah import Suspense
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useMidtrans } from "@/hooks/useMidtrans";
import {
  Clock,
  AlertCircle,
  CreditCard,
  Loader2,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

// 2. Ubah nama fungsi utama yang lama menjadi "ContinuePaymentContent"
//    (Jangan diexport default dulu)
export function ContinuePaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoice = searchParams.get("invoice");
  const source = searchParams.get("source") || null;

  const { isLoaded: isMidtransLoaded } = useMidtrans();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // ... (SEMUA LOGIKA LAMA ANDA TETAP SAMA DI SINI) ...

  // ==================== FETCH BOOKING ====================

  const fetchBooking = useCallback(async () => {
    if (!invoice) {
      toast.error("Invoice tidak ditemukan");
      router.push("/my-booking");
      return;
    }

    try {
      const response = await api.get(`api/bookings/invoice/${invoice}`);
      const bookingData = response.data.data;

      setBooking(bookingData);

      let remainingSeconds = 0;

      if (bookingData.remaining_seconds !== undefined) {
        remainingSeconds = Math.floor(bookingData.remaining_seconds);
      } else if (bookingData.transaction?.remaining_seconds !== undefined) {
        remainingSeconds = Math.floor(
          bookingData.transaction.remaining_seconds
        );
      } else {
        const createdAt = new Date(bookingData.created_at);
        const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
        const now = new Date();
        remainingSeconds = Math.max(
          0,
          Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        );
      }

      if (remainingSeconds > 900) {
        const createdAt = new Date(bookingData.created_at);
        const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
        const now = new Date();
        remainingSeconds = Math.max(
          0,
          Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        );
      }

      setTimeLeft(remainingSeconds);

      if (remainingSeconds === 0) {
        toast.error("Transaksi sudah expired");
        setTimeout(() => router.push("/my-booking"), 2000);
      }
    } catch (error: any) {
      console.error("❌ Error fetching booking:", error);

      if (error.response?.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push("/login");
      } else if (error.response?.status === 403) {
        toast.error("Anda tidak memiliki akses ke booking ini.");
        router.push("/my-booking");
      } else {
        toast.error(
          error.response?.data?.message || "Gagal memuat data booking"
        );
        router.push("/my-booking");
      }
    } finally {
      setIsLoading(false);
    }
  }, [invoice, router]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // ==================== COUNTDOWN TIMER ====================

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Waktu pembayaran habis");
          setTimeout(() => router.push("/my-booking"), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router]);

  // ==================== HANDLE PAYMENT ====================

  const handleContinuePayment = async () => {
    if (!isMidtransLoaded) {
      toast.error("Midtrans belum siap, mohon tunggu...");
      return;
    }

    if (timeLeft <= 0) {
      toast.error("Waktu pembayaran sudah habis");
      return;
    }

    if (!window.snap) {
      toast.error("Payment gateway tidak tersedia");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await api.get(`api/bookings/${invoice}/payment-token`);
      const { snap_token } = response.data.data;

      if (!snap_token) {
        throw new Error("Snap token tidak diterima dari server");
      }

      console.log("🎫 Opening Midtrans payment...");

      window.snap.pay(snap_token, {
        onSuccess: (result: any) => {
          console.log("✅ Payment success:", result);
          toast.success("Pembayaran berhasil!");
          if (source === "mabar") {
            router.push(`/my-mabar/?tab=created`);
            return;
          }
          router.push(`/booking/success?invoice=${invoice}`);
        },
        onPending: (result: any) => {
          console.log("⏳ Payment pending:", result);
          toast.info("Pembayaran menunggu konfirmasi");
          router.push(`/booking/pending?invoice=${invoice}`);
        },
        onError: (error: any) => {
          console.error("❌ Payment error:", error);
          toast.error("Pembayaran gagal. Silakan coba lagi.");
          setIsProcessing(false);
        },
        onClose: () => {
          console.log("🚪 Payment modal closed");
          toast.warning("Anda menutup halaman pembayaran");
          setIsProcessing(false);
        },
      });
    } catch (error: any) {
      console.error("❌ Payment error:", error);

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Booking sudah tidak valid");
        setTimeout(() => router.push("/my-booking"), 2000);
      } else {
        toast.error(
          error.response?.data?.message || "Gagal melanjutkan pembayaran"
        );
      }

      setIsProcessing(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> =
      {
        waiting_payment: {
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: Clock,
          label: "Menunggu Pembayaran",
        },
        pending: {
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: Clock,
          label: "Pending",
        },
        active: {
          color: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
          label: "Aktif",
        },
        expired: {
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: XCircle,
          label: "Expired",
        },
      };

    const item = config[status] || config.pending;
    const Icon = item.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${item.color} text-xs font-semibold`}
      >
        <Icon className="w-4 h-4" />
        <span>{item.label}</span>
      </div>
    );
  };

  // ==================== LOADING STATE ====================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            Booking dengan invoice ini tidak ditemukan atau sudah tidak valid.
          </p>
          <button
            onClick={() => router.push("/my-bookings")}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition"
          >
            Kembali ke My Bookings
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Timer Header */}
        <div
          className={`p-6 text-center ${
            timeLeft < 300
              ? "bg-gradient-to-r from-red-500 to-orange-500"
              : "bg-gradient-to-r from-orange-500 to-red-500"
          } text-white`}
        >
          <Clock className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm opacity-90 mb-2">Waktu Tersisa</p>
          <p
            className={`text-5xl font-bold tracking-tight ${
              timeLeft < 60 ? "animate-pulse" : ""
            }`}
          >
            {formatTime(timeLeft)}
          </p>
          {timeLeft < 300 && (
            <p className="text-xs mt-2 opacity-90">
              ⚠️ Segera selesaikan pembayaran!
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            {getStatusBadge(booking.status)}
          </div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
              <p className="font-mono font-bold text-gray-900">
                {booking.invoice_number}
              </p>
            </div>

            <div className="border-t pt-3 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {booking.field?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.field?.venue?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-gray-700 font-medium">
                  {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
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
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  Total Pembayaran
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  Rp {booking.price?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Perhatian!</strong> Selesaikan pembayaran sebelum waktu
              habis atau booking akan dibatalkan otomatis.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinuePayment}
              disabled={isProcessing || timeLeft === 0 || !isMidtransLoaded}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-base hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : !isMidtransLoaded ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Lanjutkan Pembayaran</span>
                </>
              )}
            </button>

            <button
              onClick={() => router.push("/my-booking")}
              disabled={isProcessing}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              Kembali
            </button>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Anda akan diarahkan ke halaman pembayaran Midtrans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}