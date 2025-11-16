"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Check,
  X,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Crown,
  Download,
  Save,
  Calendar,
  MapPin,
  FileImage,
  Loader2,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Target,
} from "lucide-react";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { getMabarSession } from "@/lib/services/mabar.service";

// ==================== TYPES ====================

type ParticipantStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "awaiting_approval"
  | "waiting_payment";

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Participant {
  id: string;
  name: string;
  phone?: string;
  status: ParticipantStatus;
  is_guest?: boolean;
  payment_proof?: string;
}

interface MabarSession {
  id: string;
  title: string;
  description: string;
  slots_total: number;
  price_per_slot: number;
  payment_instructions: string;
  participants: Participant[];
  booking: {
    booking_date: string;
    booked_slots: string[];
    field: {
      name: string;
      location?: string;
    };
  };
}

interface EditFormData {
  title: string;
  description: string;
  slots_total: number;
  price_per_slot: number;
  payment_instructions: string;
}

// ==================== CONSTANTS ====================

const STATUS_CONFIG: Record<ParticipantStatus, StatusConfig> = {
  approved: {
    label: "Disetujui",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  pending: {
    label: "Menunggu Review",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  rejected: {
    label: "Ditolak",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  awaiting_approval: {
    label: "Perlu Approval",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: AlertCircle,
  },
  waiting_payment: {
    label: "Belum Bayar",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Clock,
  },
};

// ==================== HELPERS ====================

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getParticipantInitial = (name: string): string => {
  return name?.charAt(0).toUpperCase() || "?";
};

// ==================== MAIN COMPONENT ====================

export default function HostMabarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");

  // State Management
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    title: "",
    description: "",
    slots_total: 0,
    price_per_slot: 0,
    payment_instructions: "",
  });

  // Data Fetching
  const {
    data: session,
    isLoading,
    mutate,
  } = useSWR<MabarSession>(
    sessionId ? ["mabar", sessionId] : null,
    () => getMabarSession(sessionId as string),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Update form when session data changes
  useEffect(() => {
    if (session) {
      setEditForm({
        title: session.title || "",
        description: session.description || "",
        slots_total: session.slots_total || 0,
        price_per_slot: session.price_per_slot || 0,
        payment_instructions: session.payment_instructions || "",
      });
    }
  }, [session]);

  // Computed Values
  const stats = React.useMemo(() => {
    if (!session?.participants) {
      return {
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        totalRevenue: 0,
        fillRate: 0,
        remainingSlots: session?.slots_total || 0,
      };
    }

    const approvedCount = session.participants.filter(
      (p) => p.status === "approved"
    ).length;

    const pendingCount = session.participants.filter((p) =>
      ["pending", "awaiting_approval", "waiting_payment"].includes(p.status)
    ).length;

    const rejectedCount = session.participants.filter(
      (p) => p.status === "rejected"
    ).length;

    const totalRevenue = approvedCount * (session.price_per_slot || 0);
    const fillRate = session.slots_total
      ? Math.round((approvedCount / session.slots_total) * 100)
      : 0;
    const remainingSlots = (session.slots_total || 0) - approvedCount;

    return {
      approvedCount,
      pendingCount,
      rejectedCount,
      totalRevenue,
      fillRate,
      remainingSlots,
    };
  }, [session]);

  // Event Handlers
  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    mutate();
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    try {
      // TODO: Implement API call to update session
      // await updateMabarSession(sessionId, editForm);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      await mutate();
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update session:", error);
      alert("Gagal menyimpan perubahan");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (session) {
      setEditForm({
        title: session.title,
        description: session.description,
        slots_total: session.slots_total,
        price_per_slot: session.price_per_slot,
        payment_instructions: session.payment_instructions,
      });
    }
    setEditMode(false);
  };

  const handleViewPaymentProof = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleApproveParticipant = async (participantId: string) => {
    try {
      // TODO: Implement API call
      console.log("Approving participant:", participantId);
      await mutate();
    } catch (error) {
      console.error("Failed to approve participant:", error);
    }
  };

  const handleRejectParticipant = async (participantId: string) => {
    try {
      // TODO: Implement API call
      console.log("Rejecting participant:", participantId);
      await mutate();
    } catch (error) {
      console.error("Failed to reject participant:", error);
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm("Yakin ingin menghapus peserta ini?")) return;

    try {
      // TODO: Implement API call
      console.log("Deleting participant:", participantId);
      await mutate();
    } catch (error) {
      console.error("Failed to delete participant:", error);
    }
  };

  const handleAddParticipant = async (data: {
    name: string;
    phone: string;
  }) => {
    try {
      // TODO: Implement API call
      console.log("Adding participant:", data);
      await mutate();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add participant:", error);
      throw error;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat data sesi...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Sesi tidak ditemukan</p>
          <button
            onClick={handleBack}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <Header
        editMode={editMode}
        editForm={editForm}
        isUpdating={isUpdating}
        session={session}
        stats={stats}
        onBack={handleBack}
        onRefresh={handleRefresh}
        onEditFormChange={setEditForm}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onEnterEditMode={() => setEditMode(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} pricePerSlot={session.price_per_slot} />

        {/* Session Info */}
        <SessionInfo session={session} />

        {/* Add Participant Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-700 hover:text-purple-600 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah Peserta Manual (Guest)</span>
        </button>

        {/* Participants List */}
        <ParticipantsList
          participants={session.participants || []}
          stats={stats}
          onViewPaymentProof={handleViewPaymentProof}
          onApprove={handleApproveParticipant}
          onReject={handleRejectParticipant}
          onDelete={handleDeleteParticipant}
        />
      </div>

      {/* Modals */}
      <AddParticipantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddParticipant}
      />

      <ImageModal
        isOpen={showImageModal}
        imageUrl={selectedImage}
        onClose={() => setShowImageModal(false)}
      />
    </div>
  );
}

// ==================== SUB COMPONENTS ====================

interface HeaderProps {
  editMode: boolean;
  editForm: EditFormData;
  isUpdating: boolean;
  session: MabarSession;
  stats: {
    approvedCount: number;
    pendingCount: number;
  };
  onBack: () => void;
  onRefresh: () => void;
  onEditFormChange: (form: EditFormData) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEnterEditMode: () => void;
}

function Header({
  editMode,
  editForm,
  isUpdating,
  session,
  stats,
  onBack,
  onRefresh,
  onEditFormChange,
  onSaveEdit,
  onCancelEdit,
  onEnterEditMode,
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm">
              <Crown className="w-4 h-4" />
              <span>Host Dashboard</span>
            </div>
          </div>
        </div>

        {editMode ? (
          <EditModeHeader
            editForm={editForm}
            isUpdating={isUpdating}
            onFormChange={onEditFormChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <ViewModeHeader
            session={session}
            // stats={stats}
            onEdit={onEnterEditMode}
          />
        )}
      </div>
    </div>
  );
}

interface EditModeHeaderProps {
  editForm: EditFormData;
  isUpdating: boolean;
  onFormChange: (form: EditFormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditModeHeader({
  editForm,
  isUpdating,
  onFormChange,
  onSave,
  onCancel,
}: EditModeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <input
        type="text"
        value={editForm.title}
        onChange={(e) => onFormChange({ ...editForm, title: e.target.value })}
        className="w-full px-4 py-2.5 text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        placeholder="Judul Sesi"
        disabled={isUpdating}
      />
      <textarea
        value={editForm.description}
        onChange={(e) =>
          onFormChange({ ...editForm, description: e.target.value })
        }
        className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
        rows={2}
        placeholder="Deskripsi..."
        disabled={isUpdating}
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-sm"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Batal
        </button>
      </div>
    </motion.div>
  );
}

interface ViewModeHeaderProps {
  session: MabarSession;
  stats: {
    approvedCount: number;
    pendingCount: number;
    fillRate: number;
  };
  onEdit: () => void;
}

function ViewModeHeader({ session, stats, onEdit }: ViewModeHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1">
          {session.title}
        </h1>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {session.description || "Tidak ada deskripsi"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
            <Users className="w-4 h-4" />
            <span>
              {/* {stats.approvedCount}/{session.slots_total} */}
            </span>
          </div>
          {/* {stats.pendingCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>{stats.pendingCount} Review</span>
            </div>
          )} */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            {/* <span>{stats.fillRate}% Terisi</span> */}
          </div>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all shadow-sm"
      >
        <Edit3 className="w-4 h-4" />
        Edit
      </button>
    </div>
  );
}

interface StatsCardsProps {
  stats: {
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    remainingSlots: number;
    totalRevenue: number;
  };
  pricePerSlot: number;
}

function StatsCards({ stats, pricePerSlot }: StatsCardsProps) {
  const cards = [
    {
      icon: CheckCircle2,
      color: "emerald",
      value: stats.approvedCount,
      label: "Disetujui",
    },
    {
      icon: Clock,
      color: "amber",
      value: stats.pendingCount,
      label: "Pending",
    },
    {
      icon: XCircle,
      color: "rose",
      value: stats.rejectedCount,
      label: "Ditolak",
    },
    {
      icon: Target,
      color: "blue",
      value: stats.remainingSlots,
      label: "Slot Sisa",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
              <card.icon className={`w-5 h-5 text-${card.color}-600`} />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {card.value}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">{card.label}</p>
        </motion.div>
      ))}

      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all col-span-2 lg:col-span-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-xs font-medium text-white/80 mb-1">Total Revenue</p>
        <p className="text-xl font-bold text-white">
          {formatPrice(stats.totalRevenue)}
        </p>
      </motion.div>
    </div>
  );
}

interface SessionInfoProps {
  session: MabarSession;
}

function SessionInfo({ session }: SessionInfoProps) {
  const timeSlots = session.booking?.booked_slots || [];
  const startTime = timeSlots[0] || "-";
  const endTime = timeSlots[timeSlots.length - 1] || "-";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-600" />
        Informasi Sesi
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          icon={MapPin}
          iconColor="purple"
          title="Lokasi"
          value={session.booking?.field?.name || "-"}
          subtitle={session.booking?.field?.location}
        />
        <InfoCard
          icon={Calendar}
          iconColor="blue"
          title="Tanggal"
          value={
            session.booking?.booking_date
              ? formatDate(session.booking.booking_date)
              : "-"
          }
        />
        <InfoCard
          icon={Clock}
          iconColor="orange"
          title="Waktu"
          value={`${startTime} - ${endTime}`}
        />
      </div>

      {/* Payment Instructions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1">
              Cara Pembayaran
            </p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {session.payment_instructions || "Tidak ada instruksi pembayaran"}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">
              <DollarSign className="w-3 h-3" />
              {formatPrice(session.price_per_slot)} / orang
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  value: string;
  subtitle?: string;
}

function InfoCard({ icon: Icon, iconColor, title, value, subtitle }: InfoCardProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 bg-${iconColor}-100 rounded-lg shrink-0`}>
        <Icon className={`w-4 h-4 text-${iconColor}-600`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{title}</p>
        <p className="font-semibold text-sm text-gray-900 truncate">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-600 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface ParticipantsListProps {
  participants: Participant[];
  stats: {
    approvedCount: number;
    pendingCount: number;
  };
  onViewPaymentProof: (imageUrl: string) => void;
  onApprove: (participantId: string) => void;
  onReject: (participantId: string) => void;
  onDelete: (participantId: string) => void;
}

function ParticipantsList({
  participants,
  stats,
  onViewPaymentProof,
  onApprove,
  onReject,
  onDelete,
}: ParticipantsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Daftar Peserta ({participants.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">
            <Check className="w-3 h-3" /> {stats.approvedCount}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold">
            <Clock className="w-3 h-3" /> {stats.pendingCount}
          </span>
        </div>
      </div>

      {participants.length > 0 ? (
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              index={index}
              onViewPaymentProof={onViewPaymentProof}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyParticipants />
      )}
    </div>
  );
}

interface ParticipantCardProps {
  participant: Participant;
  index: number;
  onViewPaymentProof: (imageUrl: string) => void;
  onApprove: (participantId: string) => void;
  onReject: (participantId: string) => void;
  onDelete: (participantId: string) => void;
}

function ParticipantCard({
  participant,
  index,
  onViewPaymentProof,
  onApprove,
  onReject,
  onDelete,
}: ParticipantCardProps) {
  const statusConfig = STATUS_CONFIG[participant.status];
  const StatusIcon = statusConfig?.icon || Clock;
  const isPendingReview = ["pending", "awaiting_approval", "waiting_payment"].includes(
    participant.status
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border border-gray-200 hover:border-gray-300 rounded-xl p-4 hover:shadow-sm transition-all bg-white"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {getParticipantInitial(participant.name)}
          </div>
          {participant.status === "approved" && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 truncate">
                  {participant.name}
                </h3>
                {participant.is_guest && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md font-semibold shrink-0">
                    Guest
                  </span>
                )}
              </div>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${statusConfig?.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig?.label}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {participant.phone && (
            <div className="mb-3 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{participant.phone}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {participant.payment_proof && (
              <button
                onClick={() => onViewPaymentProof(participant.payment_proof!)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                <FileImage className="w-3.5 h-3.5" />
                Bukti Bayar
              </button>
            )}

            {isPendingReview && (
              <>
                <button
                  onClick={() => onApprove(participant.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Setujui
                </button>
                <button
                  onClick={() => onReject(participant.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Tolak
                </button>
              </>
            )}

            {participant.status === "rejected" && (
              <button
                onClick={() => onApprove(participant.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Setujui Ulang
              </button>
            )}

            <button
              onClick={() => onDelete(participant.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyParticipants() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-600 font-medium mb-1">Belum ada peserta</p>
      <p className="text-sm text-gray-500">
        Tambahkan peserta atau tunggu pendaftaran
      </p>
    </div>
  );
}

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; phone: string }) => Promise<void>;
}

function AddParticipantModal({
  isOpen,
  onClose,
  onAdd,
}: AddParticipantModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nama wajib diisi");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Nomor HP wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      setFormData({ name: "", phone: "" });
      onClose();
    } catch (err) {
      setError("Gagal menambahkan peserta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", phone: "" });
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Tambah Peserta Guest</h2>
                  <p className="text-sm opacity-90">Masukkan data peserta</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Masukkan nama lengkap"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nomor HP <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="08xxxxxxxxxx"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Tambahkan
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageUrl}
            alt="Payment Proof"
            className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
          />
          <div className="mt-4 flex gap-3 justify-center">
            <a
              href={imageUrl}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold transition-all"
            >
              Buka di Tab Baru
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}