import React from "react";
import { Users, Check, Clock } from "lucide-react";
import { Participant } from "@/types/edit-mabar";
import { Cards } from "./d";

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

export function ParticipantsList({
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
            <Cards
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