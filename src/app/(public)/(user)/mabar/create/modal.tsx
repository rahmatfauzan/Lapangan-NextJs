"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  X,
  CreditCard,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Banknote,
} from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  sessionData: {
    title: string;
    fieldName: string;
    date: string;
    timeSlots: string[];
    totalSlots: number;
    pricePerSlot: number;
    bookingPrice: number;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function MabarConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  sessionData,
}: ConfirmationModalProps) {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-hidden"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 text-white flex-shrink-0">
                <button
                  onClick={!isLoading ? onClose : undefined}
                  disabled={isLoading}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      Konfirmasi Pembuatan Mabar
                    </h2>
                    <p className="text-orange-100 text-xs sm:text-sm mt-1">
                      Periksa kembali detail sesi Anda
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                {/* Warning Box */}
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-1">
                        Penting untuk Diperhatikan
                      </h3>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>
                          • Setelah membuat sesi, Anda harus segera melakukan
                          pembayaran booking lapangan
                        </li>
                        <li>• Pembayaran harus dilakukan dalam 24 jam</li>
                        <li>
                          • Jika tidak membayar, sesi akan otomatis dibatalkan
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Detail Sesi Mabar
                  </h3>

                  <div className="grid gap-3">
                    {/* Title */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Judul Sesi
                        </p>
                        <p className="font-semibold text-gray-900">
                          {sessionData.title}
                        </p>
                      </div>
                    </div>

                    {/* Field */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Lapangan
                        </p>
                        <p className="font-semibold text-gray-900">
                          {sessionData.fieldName}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Tanggal
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {sessionData.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Jam Main
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {sessionData.timeSlots.length} jam (
                            {sessionData.timeSlots.join(", ")})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Participants & Price */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Total Peserta
                          </p>
                          <p className="font-semibold text-gray-900">
                            {sessionData.totalSlots} orang
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Banknote  className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Harga per Slot
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(sessionData.pricePerSlot)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Yang Harus Anda Bayar
                        </p>
                        <p className="text-xs text-gray-500">
                          Biaya booking lapangan
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {formatPrice(sessionData.bookingPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-red-200">
                    <p className="text-xs text-red-700">
                      💡 Setelah konfirmasi, Anda akan diarahkan ke halaman
                      pembayaran
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Catatan:</span> Dengan
                    membuat sesi ini, Anda setuju untuk bertanggung jawab atas
                    pembayaran booking lapangan dan pengelolaan peserta.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={!isLoading ? onClose : undefined}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <CreditCard className="w-5 h-5" />
                        </motion.div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Ya, Lanjut ke Pembayaran
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
