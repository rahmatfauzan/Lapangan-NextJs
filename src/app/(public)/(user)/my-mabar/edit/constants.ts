import { ParticipantStatus, StatusConfig } from "@/types/edit-mabar";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

export const STATUS_CONFIG: Record<ParticipantStatus, StatusConfig> = {
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