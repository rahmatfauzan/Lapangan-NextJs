import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  Edit,
  Eye,
  FileImage,
  FileX,
  Loader2,
  MapPin,
  PlayCircle,
  Smile,
  Target,
  Trophy,
  Upload,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export const TYPE_LABELS: Record<
  string,
  { label: string; icon: any; color: string }
> = {
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

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

// ✅ Format waktu dari array
export const formatTimeSlots = (slots: string[] | string) => {
  if (Array.isArray(slots)) {
    if (slots.length === 0) return "-";
    if (slots.length === 1) return slots[0];
    return `${slots[0]} - ${slots[slots.length - 1]}`;
  }
  return slots || "-";
};

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

// ✅ Card View Component - FIXED VERSION
export const MabarCard = ({
  session,
  activeTab,
  deletingId,
  cancelingId,
  onDelete,
  onUploadClick,
  onCancelClick,
  onDetailClick,
  onEditClick,
  onViewPaymentProof,
  onContinuePayment,
}: any) => {
  const typeConfig = TYPE_LABELS[session.type] || TYPE_LABELS.open_play;
  const TypeIcon = typeConfig.icon;
  const participantsCount = session?.participants_count || 0;
  const slotsTotal = session?.mabar?.slots_total || session?.slots_total || 1;
  const pricePerSlot =
    session?.price_per_slot || session?.mabar?.price_per_slot || 0;

  // ✅ FIX: Gunakan field yang sama seperti table
  const paymentProof =
    session?.payment_proof_image || session?.participant_payment_proof;

  const userStatus =
    session.user_status || session.participant_status || session.status;

  // ✅ FIX: Gunakan bookingStatus yang sama seperti table
  const bookingStatus = session?.bookingStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100"
    >
      {/* Header Card */}
      <div className={`bg-gradient-to-r ${typeConfig.color} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {activeTab === "created" && (
              <div className="p-2 bg-white/20 rounded-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="p-2 bg-white/20 rounded-lg">
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-base line-clamp-1">
                {session.mabar?.title || session.title}
              </h3>
              <p className="text-xs text-white/90 mt-0.5">{typeConfig.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Lokasi */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Lokasi</p>
            <p className="text-sm text-gray-900 font-semibold">
              {session.booking?.field?.name || session.field}
            </p>
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="flex gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Tanggal</p>
              <p className="text-sm text-gray-900 font-semibold">
                {format(
                  new Date(session?.booking_date || session.date),
                  "dd MMM yyyy",
                  { locale: localeId }
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 flex-1">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Waktu</p>
              <p className="text-sm text-gray-900 font-semibold">
                {formatTimeSlots(session.booked_slots)}
              </p>
            </div>
          </div>
        </div>

        {/* Peserta & Harga */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">Peserta</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-bold text-gray-900">
                {participantsCount}/{slotsTotal}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${typeConfig.color}`}
                style={{
                  width: `${(participantsCount / slotsTotal) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium mb-2">Harga</p>
            <p className="text-base font-bold text-gray-900">
              {formatPrice(pricePerSlot)}
            </p>
          </div>
        </div>

        {/* Status untuk joined tab */}
        {activeTab === "joined" && (
          <div className="space-y-3 pt-3 border-t">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">
                Status Partisipasi
              </p>
              {getParticipantStatusBadge(userStatus)}
            </div>

            {/* ✅ FIX: Tampilkan badge seperti di table */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">
                Bukti Pembayaran
              </p>
              {paymentProof ? (
                <button
                  onClick={() => onViewPaymentProof(paymentProof)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all w-full justify-center"
                >
                  <FileImage className="w-4 h-4" />
                  <span className="text-sm font-semibold">Lihat</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg w-full justify-center">
                  <FileX className="w-4 h-4" />
                  <span className="text-sm font-medium">Belum Upload</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Booking untuk created tab */}
        {activeTab === "created" && bookingStatus && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 font-medium mb-2">
              Status Booking Lapangan
            </p>
            {getBookingStatusBadge(bookingStatus)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t flex gap-2">
        <button
          onClick={() => onDetailClick(session.id_mabar_session)}
          className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Detail
        </button>

        {activeTab === "created" && (
          <>
            {bookingStatus === "waiting_payment" ? (
              <button
                onClick={() => onContinuePayment(session.invoice)}
                className="py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2"
                title="Lanjut Pembayaran"
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Bayar</span>
              </button>
            ) : (
              <button
                onClick={() => onEditClick(session.id)}
                className="py-2.5 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
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
                onClick={() => onUploadClick(session.id)}
                className="py-2.5 px-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all flex items-center gap-2"
                title="Upload"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload</span>
              </button>
            )}
            {(userStatus === "pending" ||
              userStatus === "waiting_payment" ||
              userStatus === "approved") && (
              <button
                onClick={() => onCancelClick(session.id)}
                disabled={cancelingId === session.id}
                className="py-2.5 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 flex items-center gap-2"
                title="Cancel"
              >
                {cancelingId === session.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Batal</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    <span className="text-sm font-medium">Batal</span>
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};
