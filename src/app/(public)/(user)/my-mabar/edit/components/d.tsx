// app/host-mabar/components/ParticipantCard.tsx
import React from "react";
import { User, CheckCircle, Clock, XCircle, Trash2, Image } from "lucide-react";
import { Participant } from "@/types/edit-mabar";

interface ParticipantCardProps {
  participant: Participant;
  index: number;
  onViewPaymentProof: (imageUrl: string) => void;
  onApprove: (participantId: string) => void;
  onReject: (participantId: string) => void;
  onDelete: (participantId: string) => void;
}

export function Cards({
  participant,
  index,
  onViewPaymentProof,
  onApprove,
  onReject,
  onDelete,
}: ParticipantCardProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      approved: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Disetujui",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      awaiting_approval: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Menunggu Persetujuan",
        icon: <Clock className="w-4 h-4" />,
      },
      waiting_payment: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        label: "Menunggu Pembayaran",
        icon: <Clock className="w-4 h-4" />,
      },
      rejected: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        label: "Ditolak",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    return configs[status as keyof typeof configs] || configs.waiting_payment;
  };

  const statusConfig = getStatusConfig(participant.status);
  const displayName = participant?.name|| participant.guest_name || "Guest";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              {participant.guest_name && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Guest
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* View Payment Proof Button */}
          {participant.payment_proof_image && (
            <button
              onClick={() => onViewPaymentProof(participant.payment_proof_image!)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
              title="Lihat Bukti Pembayaran"
            >
              <Image className="w-4 h-4" />
            </button>
          )}

          {/* Approve Button - Only for awaiting_approval */}
          {participant.status === "awaiting_approval" && (
            <button
              onClick={() => onApprove(participant.id)}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all"
              title="Setujui"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          {/* Reject Button - Only for awaiting_approval */}
          {participant.status === "awaiting_approval" && (
            <button
              onClick={() => onReject(participant.id)}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
              title="Tolak"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button - For all statuses */}
          <button
            onClick={() => onDelete(participant.id)}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
            title="Hapus Peserta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Payment Proof Preview - Show if exists */}
      {participant.payment_proof_image && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Bukti Pembayaran:</span>
          </div>
          <button
            onClick={() => onViewPaymentProof(participant.payment_proof_image!)}
            className="relative group"
          >
            <img
              src={participant.payment_proof_image}
              alt="Payment Proof Preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all flex items-center justify-center">
              <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Klik untuk memperbesar
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}