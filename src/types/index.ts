import { Participant } from "./edit-mabar";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  roles?: Role[];
  email_verified_at?: string;
  image: string | null;
}

export interface Role {
  id: number;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DashboardStats {
  revenue: number;
  bookings: number;
  newUsers: number;
  activeMabar: number;
}

export interface Slots {
  time: string;
  is_available: boolean;
  reason: string;
}

export interface SportCategory {
  id: number;
  name: string;
  icon?: string;
  fields_count: number;
}

// types/index.ts
export interface FieldOperatingHours {
  day_of_week: number;
  is_open: boolean; // <-- TAMBAHKAN INI
  start_time: string; // "HH:MM:SS"
  end_time: string; // "HH:MM:SS"
}

export interface Field {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive";
  field_photo?: null;
  price_weekday: number;
  price_weekend: number;
  sport_category: SportCategory;
  operating_hours: FieldOperatingHours[];
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
  links: any[]; // (Bisa didetailkan lagi jika perlu)
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface FilterTab {
  label: string;
  value: string;
}

export type DayHour = {
  day_of_week: number;
  is_open: boolean;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
};

export interface FieldBlock {
  id: number;
  field_id: number;
  reason: string | null;
  start_datetime: string; // "YYYY-MM-DD HH:MM:SS"
  end_datetime: string; // "YYYY-MM-DD HH:MM:SS"
}

export interface MabarSession {
  id: number;
  title: string;
  type: "open_play" | "team_challenge" | "mini_tournament";
  description: string | null;
  cover_image: string | null; // URL lengkap
  slots_total: number;
  price_per_slot: number;
  payment_instructions: string;
  fieldName: string;

  sport_category: SportCategory;

  // Ini didapat dari withCount()
  participants_count: number;

  // Relasi (dimuat opsional)
  host?: User;
  booking?: Booking; // Relasi dengan Booking
  participants?: Participant[];
}

export interface Booking {
  id: number;
  invoice_number: string;
  booked_status: "waiting_payment" | "failed" | "cancelled" | "active";
  booking_date: string;
  booked_slots: string[]; // Misalnya slot waktu yang dipesan
  price: number;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
  is_guest_order: boolean;
  user: User;
  field: Field; // Data terkait lapangan yang dipesan
}

export interface UpcomingMabar {
  id: number;
  title: string;
  type: "open_play" | "team_challenge" | "mini_tournament";
  host: string;
  fieldName: string;
  date: string;
  slots_total: any;
}

export interface MabarParticipant {
  id: number;
  status: "awaiting_approval" | "approved" | "rejected" | "waiting_payment";
  user_id: number;
  mabar_session_id: number;
  guest_name?: string;
  guest_phone?: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  image: string | null;
}

export default interface Event {
  id: number;
  title: string;
  type: "open_play" | "team_challenge" | "mini_tournament";
  description: string | null;
  cover_image: string | null; // URL lengkap
  slots_total: number;
  price_per_slot: number;
  payment_instructions: string;
  fieldName: string;
}