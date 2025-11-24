"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Users,
  Info,
  AlertCircle,
  Trophy,
  Target,
  Smile,
  UserPlus,
  Share2,
  Shield,
  CreditCard,
  Copy,
  Check,
  Crown,
  CheckCircle2,
  XCircle,
  Upload,
  LogIn,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import useSWR, { mutate } from "swr";
import {
  getMabarSession,
  uploadPaymentProof,
} from "@/lib/services/mabar.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import JoinSessionModal from "./modal.tsx";
import { UploadPaymentModal } from "../../my-mabar/components/UploadPaymentModal.js";

// ==================== UTILITIES ====================

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> =
  {
    open_play: {
      label: "Open Play",
      icon: Target,
      color: "from-blue-500 to-blue-600",
    },
    mini_tournament: {
      label: "Mini Turnamen",
      icon: Trophy,
      color: "from-yellow-500 to-yellow-600",
    },
    team_challenge: {
      label: "Team Challenge",
      icon: Smile,
      color: "from-purple-500 to-purple-600",
    },
  };

// ==================== COMPONENTS ====================

const InfoItem = ({ icon: Icon, label, value, colorClass = "orange" }: any) => (
  <div
    className={`flex items-center gap-3 p-3 bg-${colorClass}-50 rounded-lg border border-${colorClass}-100`}
  >
    <div className={`p-2 bg-${colorClass}-500 rounded-lg`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="font-bold text-gray-900 text-sm truncate">{value}</p>
    </div>
  </div>
);

// ✅ DYNAMIC JOIN BUTTON
const JoinButton = ({
  status,
  availableSlots,
  onJoin,
  onUploadPayment,
}: {
  status: string;
  availableSlots: number;
  onJoin: () => void;
  onUploadPayment: () => void;
}) => {
  const router = useRouter();

  // Button configurations
  const BUTTON_CONFIG: Record<
    string,
    {
      label: string;
      disabled: boolean;
      onClick: () => void;
      className: string;
      icon: any;
    }
  > = {
    guest: {
      label: "Login untuk Gabung",
      disabled: false,
      onClick: () => {
        toast.info("Silakan login terlebih dahulu");
        router.push("/login");
      },
      className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      icon: LogIn,
    },
    host: {
      label: "Anda adalah Host",
      disabled: true,
      onClick: () => {},
      className:
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white opacity-90 cursor-not-allowed",
      icon: Crown,
    },
    approved: {
      label: "Anda Sudah Terdaftar",
      disabled: true,
      onClick: () => {},
      className: "bg-white text-green-600 cursor-not-allowed",
      icon: CheckCircle2,
    },
    pending: {
      label: "Menunggu Persetujuan",
      disabled: true,
      onClick: () => {},
      className:
        "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white cursor-wait animate-pulse",
      icon: Clock,
    },
    rejected: {
      label: "Permintaan Ditolak",
      disabled: true,
      onClick: () => {},
      className: "text-red-600 bg-white cursor-not-allowed",
      icon: XCircle,
    },
    waiting_payment: {
      label: "Upload Bukti Bayar",
      disabled: false,
      onClick: onUploadPayment,
      className:
        "bg-white text-orange-600 hover:bg-orange-50 border-2 border-orange-500",
      icon: Upload,
    },
    awaiting_approval: {
      label: "Menunggu Persetujuan Host",
      disabled: true,
      onClick: () => {},
      className:
        "bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-wait animate-pulse",
      icon: Clock,
    },
    none: {
      label: "Gabung Sekarang",
      disabled: false,
      onClick: onJoin,
      className: "bg-white text-orange-600 hover:bg-gray-50",
      icon: UserPlus,
    },
  };

  // Handle full slots
  if (availableSlots === 0) {
    return (
      <div className="space-y-2">
        <div className="w-full bg-gray-400 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
          <AlertCircle className="w-5 h-5" />
          Sesi Penuh
        </div>
        <p className="text-center text-xs text-white/80">
          Tidak ada slot tersedia
        </p>
      </div>
    );
  }

  const config = BUTTON_CONFIG[status] || BUTTON_CONFIG.none;
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <motion.button
        whileHover={config.disabled ? {} : { scale: 1.02 }}
        whileTap={config.disabled ? {} : { scale: 0.98 }}
        onClick={config.onClick}
        disabled={config.disabled}
        className={`w-full font-bold py-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${config.className}`}
      >
        <Icon className="w-5 h-5" />
        {config.label}
      </motion.button>

      {availableSlots <= 3 && status === "none" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-yellow-400/90 text-yellow-900 rounded-lg text-xs font-bold animate-pulse"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Hanya {availableSlots} slot tersisa!
        </motion.div>
      )}

      {/* Info untuk status waiting_payment */}
      {status === "waiting_payment" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
        >
          <Info className="w-3.5 h-3.5" />
          Silakan upload bukti pembayaran Anda
        </motion.div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function JoinBookingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const sessionId = searchParams.get("id");

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch session data
  const { data: session, isLoading } = useSWR(
    sessionId ? ["mabar", sessionId] : null,
    () => getMabarSession(sessionId as string),
    { revalidateOnFocus: true }
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sessionId]);

  // ✅ Get user status
  const getUserStatus = (): string => {
    if (!user) return "guest";
    if (!session) return "none";
    if (user.id === session.host?.id) return "host";

    const participant = session.participants?.find(
      (p: any) => p.user?.id === user.id
    );
    return participant ? participant.status : "none";
  };

  const status = getUserStatus();

  // ✅ Handler untuk upload bukti pembayaran
  const handleUploadPayment = async (file: File) => {
    if (!sessionId) {
      toast.error("Session ID tidak ditemukan");
      return;
    }

    setIsUploading(true);
    try {
      console.log("📤 Uploading payment proof:", sessionId);
      await uploadPaymentProof(sessionId, file);
      toast.success("Bukti pembayaran berhasil diupload!");

      // Revalidate data
      mutate(["mabar", sessionId]);

      // Tutup modal
      setUploadModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Gagal upload bukti pembayaran");
    } finally {
      setIsUploading(false);
    }
  };

  // Handlers
  const handleShare = async () => {
    try {
      await navigator.share({
        title: session?.title,
        text: `Gabung yuk! ${session?.title}`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link berhasil disalin!");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} disalin!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleJoinSuccess = () => {
    mutate(sessionId ? ["mabar", sessionId] : null);
  };

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Sesi Tidak Ditemukan
          </h2>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // ==================== VARIABLES ====================
  const availableSlots = session.slots_total - session.participants_count;
  const progressPercentage =
    (session.participants_count / session.slots_total) * 100;
  const typeConfig = TYPE_LABELS[session.type] || TYPE_LABELS.open_play;
  const TypeIcon = typeConfig.icon;

  // ==================== RENDER ====================
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Kembali</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-2">{session.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={`bg-gradient-to-r ${typeConfig.color} text-white flex items-center gap-1`}
            >
              <TypeIcon className="w-3 h-3" />
              {typeConfig.label}
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm text-white">
              {session.sport_category?.name}
            </Badge>
            <Badge
              className={
                availableSlots > 0
                  ? "bg-green-400/90 text-white"
                  : "bg-red-400/90 text-white"
              }
            >
              {availableSlots > 0 ? `${availableSlots} Slot Tersisa` : "Penuh"}
            </Badge>
            {status !== "none" && status !== "guest" && (
              <Badge className="bg-blue-400/90 text-white flex items-center gap-1">
                {status === "host" && <Crown className="w-3 h-3" />}
                {status === "host"
                  ? "Host"
                  : status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Info */}
            <Card className="shadow-lg">
              <CardContent className="p-5">
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">
                      Slot Terisi
                    </span>
                    <span className="font-bold text-orange-600">
                      {session.participants_count}/{session.slots_total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                    />
                  </div>
                </div>

                {/* Description */}
                {session.description && (
                  <>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-orange-600" />
                      Deskripsi
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {session.description}
                    </p>
                  </>
                )}

                <Separator className="my-4" />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <InfoItem
                    icon={MapPin}
                    label="Lokasi"
                    value={session.booking?.field?.name}
                    colorClass="orange"
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Tanggal"
                    value={format(
                      new Date(session?.booking?.booking_date || ""),
                      "dd MMM yyyy",
                      { locale: localeId }
                    )}
                    colorClass="blue"
                  />
                  <InfoItem
                    icon={Clock}
                    label="Waktu"
                    value={`${session.booking?.booked_slots?.[0]} - ${
                      session.booking?.booked_slots?.[
                        session.booking.booked_slots.length - 1
                      ]
                    }`}
                    colorClass="purple"
                  />
                  <InfoItem
                    icon={Users}
                    label="Peserta"
                    value={`${session.participants_count}/${session.slots_total} orang`}
                    colorClass="green"
                  />
                </div>

                <Separator className="my-4" />

                {/* Host Info */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    Host
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <Avatar className="w-12 h-12 border-2 border-orange-300">
                      <AvatarImage src={session.host?.image || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold">
                        {session.host?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">
                          {session.host?.name}
                        </p>
                        {status === "host" && (
                          <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                        <Mail className="w-3 h-3 text-orange-600" />
                        <span className="truncate">{session.host?.email}</span>
                      </div>
                      {session.host?.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                          <Phone className="w-3 h-3 text-orange-600" />
                          {session.host?.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                {session.payment_instructions && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        Instruksi Pembayaran
                      </h3>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-3">
                          {session.payment_instructions}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-200">
                          {session.payment_instructions.match(/\d{10,}/g) && (
                            <button
                              onClick={() => {
                                const accountNumber =
                                  session.payment_instructions.match(
                                    /\d{10,}/g
                                  )?.[0];
                                if (accountNumber)
                                  copyToClipboard(
                                    accountNumber,
                                    "No. Rekening"
                                  );
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

                        <div className="flex gap-2 mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-800">
                            Pastikan melakukan pembayaran sesuai instruksi dan
                            konfirmasi ke host setelah transfer.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card className="shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    Peserta ({session.participants_count})
                  </h3>
                </div>

                {session?.participants?.length || 0 > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {session?.participants?.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={p.user?.image || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white text-sm font-bold">
                            {p.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-gray-900 truncate">
                              {p.name}
                            </p>
                            {p.is_guest && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                Guest
                              </Badge>
                            )}
                            {p.user?.id === user?.id && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          {p.user?.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {p.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Belum ada peserta</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-26 space-y-4">
              {/* Price & Join Button */}
              <Card className="shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white py-0">
                <CardContent className="p-5">
                  <div className="text-center mb-4">
                    <p className="text-xs opacity-90 mb-1">Harga per Slot</p>
                    <p className="text-4xl font-bold">
                      {formatPrice(session.price_per_slot)}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      Total: {formatPrice(session.booking?.price || 0)}
                    </p>
                  </div>

                  <JoinButton
                    status={status}
                    availableSlots={availableSlots}
                    onJoin={() => setShowJoinModal(true)}
                    onUploadPayment={() => setUploadModalOpen(true)}
                  />
                </CardContent>
              </Card>

              {/* Info Tips */}
              <Card className="shadow-lg bg-blue-50 border-2 border-blue-200 py-0">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-xs text-blue-900">
                      <p className="font-bold mb-2">Tips</p>
                      <ul className="space-y-1.5">
                        <li>• Konfirmasi dengan host</li>
                        <li>• Bawa perlengkapan sendiri</li>
                        <li>• Datang tepat waktu</li>
                        <li>• Patuhi aturan venue</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      <JoinSessionModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        session={{
          id: String(session.id),
          title: session.title,
          price_per_slot: session.price_per_slot,
          slots_total: session.slots_total,
          participants_count: session.participants_count,
          payment_instructions: session.payment_instructions,
          booking: session.booking,
        }}
        onSuccess={handleJoinSuccess}
      />

      {/* Upload Payment Modal */}
      <UploadPaymentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUploadPayment}
        isUploading={isUploading}
      />
    </div>
  );
}
