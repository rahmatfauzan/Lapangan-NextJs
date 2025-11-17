// app/host-mabar/components/header.tsx
import React from "react";
import { ChevronLeft, RefreshCw, Crown } from "lucide-react";
import { EditModeHeader } from "./EditModelHeader";
import { ViewModeHeader } from "./ViewModelHeader";
import { useMabarStore } from "@/lib/store/useMabarEditStore";

interface HeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  onSaveEdit: () => void;
}

export function Header({ onBack, onRefresh, onSaveEdit }: HeaderProps) {
  // Ambil state langsung dari store
  const { editMode, session, getStats } = useMabarStore();

  const stats = getStats();

  if (!session) return null;

  return (
    <div className="sticky top-18 z-20 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
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
          <EditModeHeader onSave={onSaveEdit} />
        ) : (
          <ViewModeHeader session={session} stats={stats} />
        )}
      </div>
    </div>
  );
}
