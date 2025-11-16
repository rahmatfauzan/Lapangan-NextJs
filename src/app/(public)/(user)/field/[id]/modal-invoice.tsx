"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  ArrowRight,
  Info,
  Loader2,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useMidtrans } from "@/hooks/useMidtrans";
import { bookingService } from "@/lib/services/transaction.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    field: any;
    date: string;
    slots: string[];
    totalPrice: number;
  } | null;
  userData: {
    name: string;
    email?: string;
    phone: string;
  };
  onBookingCreated?: () => void;
}

const BookingConfirmationModal = ({
  isOpen,
  onClose,
  bookingData,
  userData,
  onBookingCreated,
}: BookingConfirmationModalProps) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState<string | null>(null);
  const { isLoaded: isMidtransLoaded, isLoading: isMidtransLoading } =
    useMidtrans();

  // ==================== UTILITY FUNCTIONS ====================

  const getFormattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isWeekend = (dateString: string) => {
    const day = new Date(dateString).getDay();
    return day === 0 || day === 6;
  };

  const getTimeRange = (slots: string[]) => {
    if (!slots?.length) return "-";
    const sorted = [...slots].sort();
    if (sorted.length === 1) return sorted[0];
    const lastHour = parseInt(sorted[sorted.length - 1].split(":")[0]);
    return `${sorted[0]} - ${String(lastHour + 1).padStart(2, "0")}:00`;
  };

  // ==================== HELPER FUNCTIONS ====================

  const refreshCalendar = () => {
    if (onBookingCreated) {
      console.log("🔄 Refreshing calendar...");
      onBookingCreated();
    }
  };

  const showContinuePaymentModal = (invoice: string) => {
    setPendingInvoice(invoice);
    setShowContinueModal(true);
  };

  // ==================== MAIN HANDLER ====================

  const handleConfirmBooking = async () => {
    if (!agreedToTerms) {
      toast.error("Mohon setujui syarat dan ketentuan terlebih dahulu");
      return;
    }

    if (!isMidtransLoaded) {
      toast.error("Midtrans belum siap. Mohon tunggu sebentar.");
      return;
    }

    if (!bookingData) {
      toast.error("Data booking tidak valid");
      return;
    }

    setIsProcessing(true);

    try {
      // Create Booking
      const response = await bookingService.createBooking({
        field_id: bookingData.field.id,
        booking_date: bookingData.date,
        booked_slots: bookingData.slots,
        name_orders: userData.name,
        phone_orders: userData.phone,
      });

      const { snap_token, invoice_number } = response.data;

      // Refresh & Save
      refreshCalendar();

      // Validate Midtrans
      if (!snap_token || !window.snap?.pay) {
        throw new Error("Payment gateway not ready");
      }

      // Open Midtrans
      window.snap.pay(snap_token, {
        onSuccess: () => {
          refreshCalendar();
          toast.success("Pembayaran berhasil!");
          window.location.href = `/booking/success?invoice=${invoice_number}`;
        },
        onPending: () => {
          toast.info("Pembayaran menunggu konfirmasi");
          window.location.href = `/booking/pending?invoice=${invoice_number}`;
        },
        onError: () => {
          toast.error("Pembayaran gagal. Silakan coba lagi.");
          refreshCalendar();
          setIsProcessing(false);
        },
        onClose: () => {
          refreshCalendar();
          showContinuePaymentModal(invoice_number);
          setIsProcessing(false);
        },
      });

      onClose();
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401) {
        toast.error("Sesi berakhir. Silakan login kembali.");
        router.push("/login");
      } else if (status === 409) {
        toast.error("Slot sudah dipesan. Pilih waktu lain.");
        refreshCalendar();
      } else {
        toast.error(error.response?.data?.message || "Terjadi kesalahan");
      }

      setIsProcessing(false);
    }
  };

  // ==================== CONTINUE PAYMENT HANDLERS ====================

  const handleContinuePayment = () => {
    if (pendingInvoice) {
      router.push(`/booking/continue?invoice=${pendingInvoice}`);
      setShowContinueModal(false);
      onClose();
    }
  };

  const handleCancelContinue = () => {
    setShowContinueModal(false);
    setPendingInvoice(null);
    onClose();
  };

  // ==================== BODY SCROLL LOCK ====================

  useEffect(() => {
    const shouldLock = isOpen || showContinueModal;

    if (shouldLock) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, showContinueModal]);

  // ==================== EARLY RETURN ====================

  if (!bookingData) return null;

  const { field, date, slots, totalPrice } = bookingData;

  // ==================== RENDER ====================

  return (
    <>
      {/* ==================== MAIN MODAL ==================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden my-8"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition disabled:opacity-50"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Konfirmasi Booking</h2>
                    <p className="text-sm opacity-90">
                      Pastikan detail sudah benar
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
                {/* User Info */}
                <InfoCard icon={User} iconColor="blue" title="Data Pemesan">
                  <p className="font-bold text-gray-900 truncate">
                    {userData.name}
                  </p>
                  {userData.email && (
                    <p className="text-sm text-gray-600 truncate">
                      {userData.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">{userData.phone}</p>
                </InfoCard>

                {/* Booking Details */}
                <div className="space-y-3">
                  <InfoCard icon={MapPin} iconColor="orange" title="Lapangan">
                    <p className="font-bold text-gray-900">{field?.name}</p>
                    {field?.venue?.name && (
                      <p className="text-sm text-gray-600">
                        {field.venue.name}
                      </p>
                    )}
                  </InfoCard>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard
                      icon={Calendar}
                      iconColor="purple"
                      title="Tanggal"
                    >
                      <p className="font-bold text-sm text-gray-900">
                        {getFormattedDate(date)}
                      </p>
                      {isWeekend(date) && (
                        <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                          Weekend
                        </span>
                      )}
                    </InfoCard>

                    <InfoCard
                      icon={Clock}
                      iconColor="green"
                      title={`Waktu (${slots.length} slot)`}
                    >
                      <p className="font-bold text-sm text-gray-900">
                        {getTimeRange(slots)}
                      </p>
                    </InfoCard>
                  </div>

                  {/* Time Slots Detail */}
                  {slots.length > 1 && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">
                        Detail Waktu:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slots.sort().map((slot, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium bg-white px-2 py-1 rounded-lg border"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                  <div className="space-y-2 mb-3">
                    <PriceRow
                      label={`Harga Lapangan (${slots.length} slot)`}
                      value={formatRupiah(totalPrice)}
                    />
                    <PriceRow
                      label="Biaya Platform"
                      value="Gratis"
                      valueColor="text-green-600"
                    />
                  </div>
                  <div className="pt-3 border-t-2 border-orange-200 flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      Total Pembayaran
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <CreditCard
                    size={20}
                    className="text-blue-500 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">
                      Metode Pembayaran
                    </p>
                    <p>
                      Anda akan diarahkan ke{" "}
                      <span className="font-bold">Midtrans</span> untuk
                      pembayaran aman.
                    </p>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Info
                    size={16}
                    className="text-yellow-600 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-yellow-800">
                    <strong>Perhatian:</strong> Booking akan otomatis dibatalkan
                    jika pembayaran tidak diselesaikan dalam{" "}
                    <strong>15 menit</strong>.
                  </p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={isProcessing}
                    className="mt-1 w-4 h-4 text-orange-500 rounded focus:ring-orange-500 cursor-pointer disabled:opacity-50"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Saya menyetujui{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-orange-500 hover:text-orange-600 font-semibold underline"
                    >
                      syarat dan ketentuan
                    </a>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={
                      isProcessing || !agreedToTerms || !isMidtransLoaded
                    }
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isMidtransLoading || isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>
                          {isMidtransLoading ? "Loading..." : "Memproses..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Lanjut Pembayaran</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== CONTINUE PAYMENT MODAL ==================== */}
      <AnimatePresence>
        {showContinueModal && pendingInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[60]"
            onClick={handleCancelContinue}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Pembayaran Belum Selesai
                </h3>
                <p className="text-gray-600 mb-6">
                  Booking Anda masih menunggu pembayaran dalam{" "}
                  <strong>15 menit</strong>.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleContinuePayment}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Lanjutkan Pembayaran</span>
                  </button>
                  <button
                    onClick={handleCancelContinue}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Nanti Saja
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-4 font-mono">
                  Invoice: {pendingInvoice}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==================== HELPER COMPONENTS ====================

const InfoCard = ({ icon: Icon, iconColor, title, children }: any) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    orange: "bg-orange-100 text-orange-500",
    purple: "bg-purple-100 text-purple-500",
    green: "bg-green-100 text-green-500",
  };

  const bgColor = iconColor === "blue" ? "bg-blue-500" : colorMap[iconColor];

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center ${
            iconColor === "blue" ? "" : "bg-opacity-100"
          }`}
        >
          <Icon
            size={20}
            className={iconColor === "blue" ? "text-white" : ""}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

const PriceRow = ({ label, value, valueColor = "text-gray-900" }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`font-semibold ${valueColor}`}>{value}</span>
  </div>
);

export default BookingConfirmationModal;
