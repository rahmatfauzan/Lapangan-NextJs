// app/host-mabar/components/ViewModelHeader.tsx
import React from "react";
import { Edit2 } from "lucide-react";
import { MabarSession } from "@/types";
import { useMabarStore } from "@/lib/store/useMabarEditStore";

interface ViewModeHeaderProps {
  session: MabarSession;
  stats: {
    approvedCount: number;
    pendingCount: number;
    fillRate: number;
  };
}

export function ViewModeHeader({ session, stats }: ViewModeHeaderProps) {
  const { setEditMode } = useMabarStore();

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {session.title}
          </h1>
          {session.description && (
            <p className="text-gray-600 mt-1 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setEditMode(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>
            {stats.approvedCount} / {session.slots_total} Slot Terisi
          </span>
        </div>

        {stats.pendingCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-medium">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>{stats.pendingCount} Menunggu</span>
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
          <span>{stats.fillRate}% Full</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium">
          {/* <span>Rp {session.price_per_slot.toLocaleString("id-ID")}</span> */}
        </div>
      </div>
    </div>
  );
}
