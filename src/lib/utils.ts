import { MabarSession } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getEndTime = (startTime: string, duration: number): string => {
  if (duration === 0) return startTime;

  // Pisahkan jam dan menit dari startTime (cth: "12:00")
  const [startHour, minutes] = startTime.split(":").map(Number);

  // Hitung total jam selesai
  const endHours = startHour + duration;

  // Format kembali ke string HH:MM
  return `${endHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const getParticipantStatus = (
  mabar: MabarSession,
  currentUserId: number | undefined
) => {
  if (!currentUserId) {
    return { isHost: false, status: "NOT_LOGGED_IN" }; // Status baru
  }

  // 1. Cek apakah dia Host
  const isHost = mabar.host?.id === currentUserId;

  // 2. Cari Partisipan yang cocok dengan user saat ini
  const currentUserParticipant = mabar.participants?.find(
    (p) => Number(p.id) === currentUserId
  );
  // console.log('mabar.participants', mabar.participants);

  if (isHost) {
    // Host selalu terdaftar (statusnya 'approved' atau 'waiting_payment')
    return {
      isHost: true,
      status: currentUserParticipant?.status || "APPROVED",
    };
  }

  if (currentUserParticipant) {
    // Jika user sudah join, kembalikan status partisipannya
    return { isHost: false, status: currentUserParticipant.status };
  }

  // Default: Belum join
  return { isHost: false, status: "NOT_JOINED" };
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getParticipantInitial = (name: string): string => {
  return name?.charAt(0).toUpperCase() || "?";
};

export { formatRupiah, getParticipantStatus, getEndTime };
