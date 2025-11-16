"use client";

import { useRouter } from "next/navigation";
import { Users, Plus } from "lucide-react";

interface EmptyStateProps {
  activeTab: "joined" | "created";
}

export default function EmptyState({ activeTab }: EmptyStateProps) {
  const router = useRouter();

  return (
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
  );
}