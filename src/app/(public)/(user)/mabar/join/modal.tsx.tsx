"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserPlus,
  User,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface JoinSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    title: string;
    price_per_slot: number;
    slots_total: number;
    participants_count: number;
    payment_instructions?: string;
    booking?: {
      booking_date: string;
      booked_slots: string[];
      field: {
        name: string;
      };
    };
  };
  onSuccess?: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function JoinSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}: JoinSessionModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} disalin!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleJoin = async () => {
    if (!agreedToTerms) {
      toast.error("Mohon setujui syarat dan ketentuan terlebih dahulu");
      return;
    }

    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`api/mabar-sessions/${session.id}/join`, {
        name: user.name,
        phone: user.phone,
        email: user.email,
      });
      if (response.data.id) {
        setStep("success");
        console.log("Join session success");
        toast.success("Permintaan bergabung berhasil dikirim!");
        onSuccess?.(); // Panggil callback untuk refresh data
      }
    } catch (error: any) {
      console.error("Error joining session:", error);

      if (error.response?.status === 409) {
        toast.error("Anda sudah terdaftar di sesi ini");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Sesi sudah penuh");
      } else {
        toast.error("Gagal mengirim permintaan. Silakan coba lagi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
    // Reset state setelah modal ditutup
    setTimeout(() => {
      setStep("confirm");
      setAgreedToTerms(false);
    }, 300); // Delay sedikit untuk animasi close
  };

  const availableSlots = session.slots_total - session.participants_count;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {step === "confirm" ? (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-t-2xl">
                  <button
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Gabung Sesi Mabar</h2>
                      <p className="text-sm opacity-90 line-clamp-1">
                        {session.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* User Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      Data Anda
                    </h3>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
                      <Avatar className="w-12 h-12 border-2 border-orange-300">
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">
                          {user?.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                          <Mail className="w-3 h-3 text-orange-600" />
                          <span className="truncate">{user?.email}</span>
                        </div>
                        {user?.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                            <Phone className="w-3 h-3 text-orange-600" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Detail Sesi
                    </h3>
                    <div className="space-y-2">
                      {/* Price */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Harga per Slot
                          </span>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(session.price_per_slot)}
                        </span>
                      </div>

                      {/* Available Slots */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Slot Tersedia
                          </span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {availableSlots} / {session.slots_total}
                        </span>
                      </div>

                      {/* Location */}
                      {session.booking?.field && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">
                              Lokasi
                            </p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {session.booking.field.name}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Date & Time */}
                      {session.booking?.booking_date && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                Tanggal
                              </p>
                              <p className="text-xs font-bold text-gray-900">
                                {format(
                                  new Date(session.booking.booking_date),
                                  "dd MMM",
                                  {
                                    locale: localeId,
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <Clock className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                Waktu
                              </p>
                              <p className="text-xs font-bold text-gray-900">
                                {session.booking.booked_slots?.[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  {session.payment_instructions && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        Instruksi Pembayaran
                      </h3>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
                        <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed mb-3">
                          {session.payment_instructions}
                        </p>

                        {/* Copy Buttons */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-200">
                          {session.payment_instructions.match(/\d{10,}/g) && (
                            <button
                              onClick={() => {
                                const accountNumber =
                                  session.payment_instructions?.match(
                                    /\d{10,}/g
                                  )?.[0];
                                if (accountNumber) {
                                  copyToClipboard(
                                    accountNumber,
                                    "No. Rekening"
                                  );
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition"
                            >
                              {copiedText === "No. Rekening" ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Tersalin!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Salin Rekening
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              copyToClipboard(
                                session.price_per_slot.toString(),
                                "Nominal"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition"
                          >
                            {copiedText === "Nominal" ? (
                              <>
                                <Check className="w-3 h-3" />
                                Tersalin!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Salin Nominal
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div className="text-xs text-yellow-900">
                      <p className="font-semibold mb-1">Perhatian:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Permintaan akan ditinjau oleh host</li>
                        <li>Lakukan pembayaran sesuai instruksi</li>
                        <li>Host akan menghubungi Anda untuk konfirmasi</li>
                      </ul>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="agreed_to_terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) =>
                        setAgreedToTerms(checked as boolean)
                      }
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor="agreed_to_terms"
                      className="text-xs text-gray-700 cursor-pointer leading-relaxed"
                    >
                      Saya menyetujui untuk mengikuti aturan yang berlaku dan
                      akan melakukan pembayaran sesuai instruksi host{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleJoin}
                      disabled={
                        isSubmitting || !agreedToTerms || availableSlots === 0
                      }
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Kirim Permintaan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Success State
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Permintaan Terkirim!
                </h3>
                <p className="text-gray-600 mb-6">
                  Host akan meninjau permintaan Anda. Silakan cek notifikasi
                  untuk update status.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    Langkah Selanjutnya:
                  </p>
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside text-left">
                    <li>Tunggu approval dari host</li>
                    <li>Lakukan pembayaran sesuai instruksi</li>
                    <li>Konfirmasi pembayaran ke host</li>
                    <li>Siap untuk main!</li>
                  </ol>
                </div>
                <Button
                  onClick={handleCloseModal}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Mengerti
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
