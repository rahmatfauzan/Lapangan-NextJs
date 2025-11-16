"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Building2,
  CreditCard,
  Receipt,
  Printer,
  Mail,
  Ban,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoice =
    typeof params.invoice === "string" ? params.invoice : params.invoice?.[0];

  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==================== FETCH BOOKING DATA ====================

  useEffect(() => {
    if (invoice) {
      fetchBooking();
    }
  }, [invoice]);

  const fetchBooking = async () => {
    if (!invoice) {
      toast.error("Invoice tidak ditemukan");
      router.push("/my-booking");
      return;
    }

    try {
      const response = await api.get(`api/bookings/invoice/${invoice}/`);
      const bookingData = response.data.data;

      console.log("📋 Booking data:", bookingData);
      setBooking(bookingData);
    } catch (error: any) {
      console.error("❌ Error fetching booking:", error);

      if (error.response?.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push("/login");
      } else if (error.response?.status === 403) {
        toast.error("Anda tidak memiliki akses ke booking ini.");
        router.push("/my-booking");
      } else if (error.response?.status === 404) {
        toast.error("Booking tidak ditemukan.");
        router.push("/my-booking");
      } else {
        toast.error(
          error.response?.data?.message || "Gagal memuat data booking"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HANDLE ACTIONS ====================
  const handleContinuePayment = () => {
    router.push(`/booking/continue?invoice=${invoice}`);
  };

  const handleBookAgain = () => {
    if (booking.field?.id) {
      router.push(`/field/${booking.field.id}`);
    } else {
      router.push("/");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ==================== STATUS BADGE ====================

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: any; label: string }
    > = {
      waiting_payment: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: Clock,
        label: "Menunggu Pembayaran",
      },
      pending: {
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: Clock,
        label: "Pending",
      },
      active: {
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
        label: "Aktif",
      },
      cancelled: {
        color: "bg-red-100 text-red-700 border-red-300",
        icon: XCircle,
        label: "Dibatalkan",
      },
      expired: {
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: AlertCircle,
        label: "Expired",
      },
      completed: {
        color: "bg-purple-100 text-purple-700 border-purple-300",
        icon: CheckCircle,
        label: "Selesai",
      },
      failed: {
        color: "bg-red-100 text-red-700 border-red-300",
        icon: XCircle,
        label: "Gagal",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${config.color} font-semibold text-xs`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> =
      {
        success: { color: "text-green-600", icon: CheckCircle, label: "Lunas" },
        pending: { color: "text-yellow-600", icon: Clock, label: "Menunggu" },
        failed: { color: "text-red-600", icon: XCircle, label: "Gagal" },
        expired: {
          color: "text-gray-600",
          icon: AlertCircle,
          label: "Expired",
        },
      };

    const item = config[status] || config.pending;
    const Icon = item.icon;

    return (
      <span
        className={`flex items-center gap-1 text-xs font-bold ${item.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {item.label}
      </span>
    );
  };

  // ==================== RENDER ACTION BUTTONS ====================

  const renderActionButtons = () => {
    const paymentStatus = booking.transaction?.status;
    const bookingtatus = booking.status;

    // ✅ EXPIRED - Booking Again
    if (bookingtatus === "expired" || bookingtatus === "failed") {
      return (
        <div className="grid gap-2 mt-4 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-gray-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-600 transition"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button
            onClick={handleBookAgain}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Booking Lagi
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-red-900 font-semibold mb-1">
                Booking Expired
              </p>
              <p className="text-xs text-red-800">
                Booking ini sudah tidak valid. Silakan lakukan booking baru.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ✅ WAITING PAYMENT - Continue Payment & Cancel
    if (
      bookingtatus === "waiting_payment" ||
      (bookingtatus === "pending" && paymentStatus === "pending")
    ) {
      return (
        <div className="grid gap-2 mt-4 no-print">
          <button
            onClick={handleContinuePayment}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 px-4 rounded-lg text-sm font-bold hover:bg-orange-600 transition shadow-md"
          >
            <CreditCard className="w-4 h-4" />
            Lanjutkan Pembayaran
          </button>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
            <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-yellow-900 font-semibold mb-1">
                Menunggu Pembayaran
              </p>
              <p className="text-xs text-yellow-800">
                Selesaikan pembayaran dalam 15 menit atau booking akan otomatis
                dibatalkan.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ✅ LUNAS (ACTIVE/COMPLETED) - Print & Cancel (only if active)
    if (paymentStatus === "success") {
      return (
        <div className="grid gap-2 mt-4 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </button>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-green-900 font-semibold mb-1">
                Pembayaran Berhasil
              </p>
              <p className="text-xs text-green-800">
                Booking Anda telah dikonfirmasi. Harap datang sesuai jadwal yang
                telah ditentukan.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ✅ CANCELLED
    if (bookingtatus === "cancelled") {
      return (
        <div className="grid gap-2 mt-4 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-gray-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-600 transition"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button
            onClick={handleBookAgain}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Booking Lagi
          </button>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex gap-3">
            <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-900 font-semibold mb-1">
                Booking Dibatalkan
              </p>
              <p className="text-xs text-gray-700">
                Booking ini telah dibatalkan. Silakan lakukan booking baru jika
                diperlukan.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ✅ DEFAULT - Print only
    return (
      <div className="grid gap-2 mt-4 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
        >
          <Printer className="w-4 h-4" />
          Print / Download PDF
        </button>
      </div>
    );
  };

  // ==================== LOADING STATE ====================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg max-w-sm">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Booking Tidak Ditemukan
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Data booking tidak dapat ditemukan
          </p>
          <button
            onClick={() => router.push("/my-booking")}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
          >
            Kembali ke My booking
          </button>
        </div>
      </div>
    );
  }

  // ==================== VARIABLES ====================

  const bookingDate = new Date(booking.booking_date);

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 no-print">
          <button
            onClick={() => router.push("/my-booking")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Booking
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {booking.invoice_number}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        {/* Invoice Card */}
        <div className="print-content bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="print-header bg-orange-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                <div>
                  <p className="text-xs opacity-90">Invoice</p>
                  <p className="text-lg font-bold">{booking.invoice_number}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-90">Total</p>
                <p className="text-xl font-bold">
                  Rp {booking.price?.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Venue & Date Row */}
            <div className="print-section grid md:grid-cols-2 gap-3">
              {/* Venue */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-semibold mb-0.5">
                      Venue & Lapangan
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {booking.field?.name}
                    </p>
                    <p className="text-xs text-gray-700">
                      {booking.field?.venue?.name}
                    </p>
                  </div>
                </div>
                {booking.field?.venue?.address && (
                  <div className="flex gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {booking.field.venue.address}
                    </p>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex gap-2">
                  <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-0.5">
                      Tanggal Booking
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {bookingDate.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="print-section bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <p className="text-xs text-gray-600 font-semibold">
                  Jam Booking ({booking.booked_slots?.length} slot)
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {booking.booked_slots?.map((slot: string, index: number) => (
                  <span
                    key={index}
                    className="bg-white border border-gray-300 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            {/* Customer & Payment Row */}
            <div className="print-section grid md:grid-cols-2 gap-3">
              {/* Customer */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-semibold">
                    Info Pemesan
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.user?.name || booking.name_orders || "-"}
                    </p>
                  </div>
                  {(booking.user?.phone || booking.phone_orders) && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {booking.user?.phone || booking.phone_orders}
                      </p>
                    </div>
                  )}
                  {booking.user?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {booking.user.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-semibold">
                    Pembayaran
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Gateway</span>
                    <span className="font-semibold text-gray-900">
                      {booking.transaction?.payment_gateway || "Midtrans"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Jumlah</span>
                    <span className="font-semibold text-gray-900">
                      Rp{" "}
                      {booking.transaction?.amount?.toLocaleString("id-ID") ||
                        booking.price?.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-900">
                      Status
                    </span>
                    {getPaymentStatusBadge(
                      booking.transaction?.status || "pending"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="print-section bg-gray-900 rounded-lg p-3 text-white">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total Pembayaran</span>
                <span className="text-2xl font-bold">
                  Rp {booking.price?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t px-4 py-3 text-center">
            <p className="text-xs text-gray-600">
              Terima kasih telah menggunakan layanan kami
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dicetak pada:{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* ✅ Dynamic Action Buttons Based on Status */}
        {renderActionButtons()}

        {/* Download PDF Guide */}
        <div className="mt-4 no-print">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-blue-900 mb-1">
                <strong>Cara Download PDF:</strong>
              </p>
              <p className="text-xs text-blue-800">
                Klik tombol Print → Pilih "Save as PDF" → Klik Save
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-content {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
