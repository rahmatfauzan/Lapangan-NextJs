import { ComponentType } from "react";

export type ParticipantStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "awaiting_approval"
  | "waiting_payment";

export interface Participant {
  id: string;
  name: string;
  phone?: string;
  status: ParticipantStatus;
  guest_name?: string;
  payment_proof_image?: string;
  is_guest?: boolean;
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
}
