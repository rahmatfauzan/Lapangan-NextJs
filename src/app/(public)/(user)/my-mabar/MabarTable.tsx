"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Eye,
  Edit,
  Upload,
  Loader2,
  Crown,
  CheckCircle,
  XCircle,
  FileImage,
  FileX,
  UserX,
  Grid3x3,
  List,
  AlertCircle,
  PlayCircle,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import {
  formatPrice,
  formatTimeSlots,
  MabarCard,
  TYPE_LABELS,
} from "./components/MabarCard";
import { UploadPaymentModal } from "./components/UploadPaymentModal";
import { CancelConfirmationModal } from "./components/CancelConfirmationModal";
import { PaymentProofPreviewModal } from "./components/PaymentProofPreviewModal";
import { uploadPaymentProof } from "@/lib/services/mabar.service";
import { mutate } from "swr";
import { toast } from "sonner";
import { cancelMabarSession } from "@/lib/services/mabar-edit.service";

type TabType = "joined" | "created";
type ViewType = "table" | "card";

interface MabarTableProps {
  sessions: any[];
  activeTab: TabType;
  deletingId: number | null;
  onDelete: (id: number) => void;
  onUploadPayment: (id: number, file: File) => void;
  onCancelJoin?: (id: number) => void;
  onContinuePayment?: (id: string) => void;
  cancelingId?: number | null;
}

// ✅ Badge untuk status participant (joined tab)
const getParticipantStatusBadge = (status: string) => {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    approved: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
      label: "Disetujui",
    },
    pending: {
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Clock,
      label: "Menunggu Persetujuan",
    },
    rejected: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
      label: "Ditolak",
    },
    waiting_payment: {
      color: "bg-orange-100 text-orange-700 border-orange-200",
      icon: Upload,
      label: "Menunggu Pembayaran",
    },
  };

  const item = config[status] || config.pending;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${item.color} text-xs font-semibold whitespace-nowrap`}
    >
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </span>
  );
};

// ✅ Badge untuk status booking lapangan (created tab)
const getBookingStatusBadge = (status: string) => {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    active: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: PlayCircle,
      label: "Aktif",
    },
    waiting_payment: {
      color: "bg-orange-100 text-orange-700 border-orange-200",
      icon: Clock,
      label: "Menunggu Pembayaran",
    },
    failed: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
      label: "Gagal",
    },
    cancelled: {
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: AlertCircle,
      label: "Dibatalkan",
    },
  };

  const item = config[status] || config.waiting_payment;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${item.color} text-xs font-semibold whitespace-nowrap`}
    >
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </span>
  );
};

export default function MabarTable({
  sessions,
  activeTab,
  deletingId,
  onDelete,
  onContinuePayment,
  cancelingId,
}: MabarTableProps) {
  const router = useRouter();
  const [viewType, setViewType] = useState<ViewType>("table");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setUploadModalOpen(true);
  };

  const handleCancelClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setCancelModalOpen(true);
  };

  const handleUploadSubmit = async (file: File) => {
    if (!selectedSessionId) {
      toast.error("Session ID tidak ditemukan");
      return;
    }

    setIsUploading(true);
    try {
      console.log(selectedSessionId);
      await uploadPaymentProof(String(selectedSessionId), file);

      toast.success("Bukti pembayaran berhasil diupload!");
      setUploadModalOpen(false);
      setSelectedSessionId(null);
    } catch (error: any) {
      toast.error(error.message || "Gagal upload bukti pembayaran");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (selectedSessionId) {
      try {
        await cancelMabarSession(selectedSessionId);
        toast.success("Partisipasi mabar berhasil dibatalkan");

        // Refresh SWR
        await mutate(
          (key) => typeof key === "string" && key.includes("sessions")
        );

        setCancelModalOpen(false);
        setSelectedSessionId(null);
      } catch (error: any) {
        toast.error(error.message || "Gagal membatalkan sesi mabar");
      }
    }
  };

  const handleContinuePayment = (invoice: string) => {
    if (onContinuePayment) {
      console.log("Continuing payment for invoice:", invoice);
      onContinuePayment(invoice);
    }
  };

  console.log("Rendering MabarTable with sessions:", sessions);

  return (
    <>
      {/* View Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setViewType("table")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              viewType === "table"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">Tabel</span>
          </button>
          <button
            onClick={() => setViewType("card")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              viewType === "card"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="text-sm font-medium">Kartu</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewType === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Judul Mabar
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Peserta
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Harga
                </th>
                {activeTab === "joined" ? (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status Partisipasi
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Bukti Pembayaran
                    </th>
                  </>
                ) : (
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status Booking
                  </th>
                )}
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session: any) => {
                const typeConfig =
                  TYPE_LABELS[session.type] || TYPE_LABELS.open_play;
                const TypeIcon = typeConfig.icon;
                const participantsCount = session?.participants_count || 0;
                const slotsTotal =
                  session?.mabar?.slots_total || session?.slots_total || 1;
                const pricePerSlot =
                  session?.price_per_slot ||
                  session?.mabar?.price_per_slot ||
                  0;
                const paymentProof =
                  session?.payment_proof_image ||
                  session?.participant_payment_proof;
                const userStatus =
                  session.user_status ||
                  session.participant_status ||
                  session.status;
                const bookingStatus = session?.bookingStatus;

                return (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {activeTab === "created" && (
                          <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                            <Crown className="w-4 h-4 text-yellow-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm line-clamp-2 max-w-xs">
                            {session.mabar?.title || session.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 bg-gradient-to-r ${typeConfig.color} rounded-lg`}
                        >
                          <TypeIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {typeConfig.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                          {session.booking?.field?.name || session.field}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {format(
                              new Date(session?.booking_date || session.date),
                              "dd MMM yyyy",
                              { locale: localeId }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {formatTimeSlots(session.booked_slots)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {participantsCount}/{slotsTotal}
                        </span>
                      </div>
                      <div className="mt-2 w-24">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${typeConfig.color}`}
                            style={{
                              width: `${
                                (participantsCount / slotsTotal) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(pricePerSlot)}
                        </span>
                      </div>
                    </td>
                    {activeTab === "joined" ? (
                      <>
                        <td className="px-6 py-4">
                          {getParticipantStatusBadge(userStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {paymentProof ? (
                              <button
                                onClick={() => setPreviewImage(paymentProof)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                                title="Lihat Bukti Pembayaran"
                              >
                                <FileImage className="w-4 h-4" />
                                <span className="text-xs font-semibold">
                                  Lihat
                                </span>
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-500 rounded-lg">
                                <FileX className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  Belum Upload
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="px-6 py-4">
                        {bookingStatus
                          ? getBookingStatusBadge(bookingStatus)
                          : "-"}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/mabar/join?id=${session.id_mabar_session}`
                            )
                          }
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {activeTab === "created" && (
                          <>
                            {bookingStatus === "waiting_payment" ? (
                              <button
                                onClick={() =>
                                  handleContinuePayment(session.invoice)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium text-xs"
                                title="Lanjut Pembayaran"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>Bayar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/my-mabar/edit/?id=${session.id}`
                                  )
                                }
                                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        {activeTab === "joined" && (
                          <>
                            {userStatus === "waiting_payment" && (
                              <button
                                onClick={() => handleUploadClick(session.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all font-medium text-xs"
                                title="Upload Bukti Pembayaran"
                              >
                                <Upload className="w-4 h-4" />
                                Upload
                              </button>
                            )}
                            {(userStatus === "pending" ||
                              userStatus === "waiting_payment" ||
                              userStatus === "approved") && (
                              <button
                                onClick={() => handleCancelClick(session.id)}
                                disabled={cancelingId === session.id}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium text-xs disabled:opacity-50"
                                title="Batalkan Partisipasi"
                              >
                                {cancelingId === session.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Batal
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    Batal
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {viewType === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session: any) => (
            <MabarCard
              key={session.id}
              session={session}
              activeTab={activeTab}
              deletingId={deletingId}
              cancelingId={cancelingId}
              onDelete={onDelete}
              onUploadClick={handleUploadClick}
              onCancelClick={handleCancelClick}
              onDetailClick={(id: number) =>
                router.push(`/mabar/join?id=${id}`)
              }
              onEditClick={(id: number) => router.push(`/mabar/edit/${id}`)}
              onViewPaymentProof={setPreviewImage}
              onContinuePayment={handleContinuePayment}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PaymentProofPreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ""}
      />
      <UploadPaymentModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedSessionId(null);
        }}
        onSubmit={handleUploadSubmit}
        isUploading={isUploading}
      />
      <CancelConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedSessionId(null);
        }}
        onConfirm={handleCancelConfirm}
        isLoading={cancelingId === selectedSessionId}
      />
    </>
  );
}
