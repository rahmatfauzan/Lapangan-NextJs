"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Target,
  Smile,
  Loader2,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  DollarSign,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type TabType = "joined" | "created";

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

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default function MyMabarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("joined");
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        activeTab === "joined"
          ? "/mabar-sessions/my-participations"
          : "/mabar-sessions/my-sessions";

      const response = await api.get(endpoint);

      if (response.data.success) {
        setSessions(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      }
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast.error("Gagal memuat data mabar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sesi mabar ini?")) return;

    setDeletingId(sessionId);
    try {
      const response = await api.delete(`/mabar-sessions/${sessionId}`);

      if (response.data.success) {
        toast.success("Sesi mabar berhasil dihapus");
        fetchSessions();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus sesi mabar"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> =
      {
        approved: {
          color: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
          label: "Disetujui",
        },
        pending: {
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: Clock,
          label: "Menunggu",
        },
        rejected: {
          color: "bg-red-100 text-red-700 border-red-200",
          icon: XCircle,
          label: "Ditolak",
        },
        waiting_payment: {
          color: "bg-orange-100 text-orange-700 border-orange-200",
          icon: AlertCircle,
          label: "Menunggu Bayar",
        },
      };

    const item = config[status] || config.pending;
    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${item.color} text-xs font-semibold`}
      >
        <Icon className="w-3.5 h-3.5" />
        {item.label}
      </span>
    );
  };

  const tabs = [
    { key: "joined", label: "Mabar yang Saya Ikuti", icon: Users },
    { key: "created", label: "Mabar yang Saya Buat", icon: Crown },
  ];

  const filteredSessions = sessions.filter((session: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.title?.toLowerCase().includes(query) ||
      session.booking?.field?.name?.toLowerCase().includes(query) ||
      session.sport_category?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Mabar</h1>
          <p className="text-blue-100">
            Kelola sesi mabar yang Anda ikuti dan buat
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`relative px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="mabar-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search & Create Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari sesi mabar, lapangan, atau sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>

          {activeTab === "created" && (
            <button
              onClick={() => router.push("/mabar/create")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3.5 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Buat Mabar Baru
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Memuat data mabar...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Tidak ada sesi mabar
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "joined"
                ? "Anda belum mengikuti sesi mabar apapun"
                : "Anda belum membuat sesi mabar"}
            </p>
            <button
              onClick={() =>
                activeTab === "joined"
                  ? router.push("/mabar")
                  : router.push("/mabar/create")
              }
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              {activeTab === "joined" ? (
                <>
                  <Users className="w-5 h-5" />
                  Cari Mabar
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Buat Mabar
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session: any) => {
              const typeConfig =
                TYPE_LABELS[session.type] || TYPE_LABELS.open_play;
              const TypeIcon = typeConfig.icon;
              const availableSlots =
                session.slots_total - session.participants_count;
              const progressPercentage =
                (session.participants_count / session.slots_total) * 100;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group"
                >
                  {/* Header with Gradient */}
                  <div className={`bg-gradient-to-r ${typeConfig.color} p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-white">
                        <TypeIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">
                          {typeConfig.label}
                        </span>
                      </div>
                      {activeTab === "created" && (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Crown className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-semibold text-white">
                            Host
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">
                        {session.participants_count}/{session.slots_total}{" "}
                        peserta
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Slot terisi</span>
                        <span className="font-bold text-gray-900">
                          {session.participants_count}/{session.slots_total}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full bg-gradient-to-r ${typeConfig.color}`}
                        />
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 truncate">
                          {session.booking?.field?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {format(
                            new Date(session.booking?.booking_date),
                            "dd MMM yyyy",
                            {
                              locale: localeId,
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {session.booking?.booked_slots?.[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 font-semibold">
                          {formatPrice(session.price_per_slot)}/slot
                        </span>
                      </div>
                    </div>

                    {/* Status for Joined Tab */}
                    {activeTab === "joined" && session.participant_status && (
                      <div className="pt-3 border-t">
                        {getStatusBadge(session.participant_status)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/mabar/join?id=${session.id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </button>

                      {activeTab === "created" && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/mabar/edit/${session.id}`)
                            }
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={deletingId === session.id}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingId === session.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
