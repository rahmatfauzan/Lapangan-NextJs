// app/host-mabar/page.tsx
"use client";

import React, { useEffect, Suspense } from "react"; // 1. Import Suspense
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { getMabarSession } from "@/lib/services/mabar.service";
import { useMabarStore } from "@/lib/store/useMabarEditStore";
import { Header } from "./components/header";
import { StatsCards } from "./components/StatsCard";
import { SessionInfo } from "./components/SessionInfo";
import { ParticipantsList } from "./components/ParticipantsList";
import { AddParticipantModal } from "./components/AddParticipantCard";
import { ImageModal } from "./components/imageModal";
import { useMabarActions } from "@/lib/hook/useMabarActions";

// 2. Pisahkan Logic Utama ke Component "Content"
function HostMabarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");

  // Zustand store
  const {
    session,
    editMode,
    showAddModal,
    showImageModal,
    selectedImage,
    setSession,
    viewPaymentProof,
    closeImageModal,
    openAddModal,
    closeAddModal,
    getStats,
  } = useMabarStore();

  // Data Fetching with SWR
  const { data, mutate } = useSWR(
    sessionId ? ["mabar", sessionId] : null,
    () => getMabarSession(String(sessionId)),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // onSuccess bisa tetap dipakai, tapi useEffect lebih robust untuk sinkronisasi state
    }
  );

  // Sync Data SWR ke Zustand
  useEffect(() => {
    if (data) {
      setSession(data);
    }
  }, [data, setSession]);

  // Actions dari custom hook
  const {
    saveSession,
    handleApprove,
    handleReject,
    handleDelete,
    handleAddGuest,
  } = useMabarActions(sessionId, mutate);

  const stats = getStats();

  // Loading State (Saat data belum ada di SWR dan belum ada di Store)
  if (!data && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat data sesi...</p>
        </div>
      </div>
    );
  }

  // Error State (SWR selesai tapi data kosong/null)
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">
            Sesi tidak ditemukan
          </p>
          <button
            onClick={() => router.back()}
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
        onBack={() => router.back()}
        onRefresh={mutate}
        onSaveEdit={saveSession}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Cover Image Display */}
        {!editMode && session.cover_image && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <img
              src={session.cover_image}
              alt={session.title}
              className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => viewPaymentProof(session.cover_image!)}
            />
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards stats={stats} pricePerSlot={session.price_per_slot} />

        {/* Session Info */}
        <SessionInfo session={session} />

        {/* Add Guest Button */}
        <button
          onClick={openAddModal}
          className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-700 hover:text-purple-600 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah Peserta Manual (Guest)</span>
        </button>

        {/* Participants List */}
        <ParticipantsList
          participants={session.participants || []}
          stats={stats}
          onViewPaymentProof={viewPaymentProof}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      <AddParticipantModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        onAdd={handleAddGuest}
      />

      <ImageModal
        isOpen={showImageModal}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />
    </div>
  );
}

// 3. Buat Wrapper Default Export dengan Suspense
export default function HostMabarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
        </div>
      }
    >
      <HostMabarContent />
    </Suspense>
  );
}
