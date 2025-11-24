"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { Users, Crown, Loader2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Pagination from "./components/Pagination";
import MabarTable from "./MabarTable";
import EmptyState from "./Empty.state";
import useSWR from "swr";

type TabType = "joined" | "created";

const TABS = [
  { key: "joined" as const, label: "Mabar yang Saya Ikuti", icon: Users },
  { key: "created" as const, label: "Mabar yang Saya Buat", icon: Crown },
];

const ITEMS_PER_PAGE = 10;

export default function MyMabarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "joined";
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab as TabType);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch sessions
  const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

  const endpoint =
    activeTab === "joined"
      ? "/api/user/joined-sessions"
      : "/api/user/mabar-sessions";

  const { data: sessions = [], isLoading } = useSWR(endpoint, fetcher);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions;

    const query = searchQuery.toLowerCase();
    return sessions.filter((session: any) => {
      return (
        session.title?.toLowerCase().includes(query) ||
        session.mabar?.title?.toLowerCase().includes(query) ||
        session.booking?.field?.name?.toLowerCase().includes(query) ||
        session.field?.toLowerCase().includes(query) ||
        session.sport_category?.name?.toLowerCase().includes(query)
      );
    });
  }, [sessions, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Handlers
  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sesi mabar ini?")) return;

    setDeletingId(sessionId);
    try {
      const response = await api.delete(`api/mabar-sessions/${sessionId}`);

      if (response.data.success) {
        toast.success("Sesi mabar berhasil dihapus");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus sesi mabar"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadPaymentProof = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setUploadModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinuePayment = (invoiceNumber: string) => {
    router.push(`api/booking/continue?invoice=${invoiceNumber}&source=mabar`);
  };

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
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
          <EmptyState activeTab={activeTab} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <MabarTable
              sessions={currentSessions}
              activeTab={activeTab}
              deletingId={deletingId}
              onDelete={handleDeleteSession}
              onUploadPayment={handleUploadPaymentProof}
              onContinuePayment={handleContinuePayment}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredSessions.length}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
