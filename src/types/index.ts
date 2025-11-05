export interface User {
  id: number;
  name: string;
  email: string;
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

export interface Booking {
  id: number;
  invoice: string;
  customer: string;
  field: string;
  slots: number;
  total: number;
  status: "paid" | "pending" | "cancelled" | "active";
}

export interface Event {
  id: number;
  title: string;
  booking_date: string;
  type: string;
}

export interface SportCategory {
  id: number;
  name: string;
  icon?: string;
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
  field_photo?: string;
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
  end_time: string;   // HH:MM
};

export interface FieldBlock {
  id: number;
  field_id: number;
  reason: string | null;
  start_datetime: string; // "YYYY-MM-DD HH:MM:SS"
  end_datetime: string;   // "YYYY-MM-DD HH:MM:SS"
}