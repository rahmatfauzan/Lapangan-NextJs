"use client";
import React from "react";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MabarSession } from "@/types";
// --- Perbaikan Import Avatar & Checkbox ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
// ------------------------------------------
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- HELPER FUNCTION ---

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Helper untuk menghitung jam main dari slot
const getPlayTime = (slots: string[] | undefined) => {
  if (!slots || slots.length === 0)
    return { startTime: null, endTime: null, duration: 0 };

  const sortedSlots = slots.sort();
  const startTime = sortedSlots[0];
  const duration = sortedSlots.length;

  const [startHour, minutes] = startTime.split(":").map(Number);
  const endHours = startHour + duration;
  const endTime = `${endHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return { startTime, endTime, duration };
};
// -------------------------

export const createMabarColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (mabar: MabarSession) => void;
  onDelete: (mabar: MabarSession) => void;
}): ColumnDef<MabarSession>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // --- Kolom Judul & Foto ---
   {
    id: "host_name",
    // Menggunakan accessorFn untuk mengakses relasi nested (Model Host)
    accessorFn: (row) => row.host?.name ?? "Anonim",
    header: "Host",
    cell: ({ row }) => (
      <div className="font-semibold">{row.original.host?.name || "Anonim"}</div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Judul Sesi
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const mabar = row.original;
      const imageUrl = mabar.cover_image;
      const fallback = mabar.title.substring(0, 2).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={imageUrl || ""} alt={mabar.title} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{mabar.title}</span>
        </div>
      );
    },
  },

  // --- KOLOM BARU: LOKASI & TANGGAL ---
  {
    id: "location_date",
    header: "Lokasi & Tanggal",
    cell: ({ row }) => {
      const booking = row.original.booking;
      const date = booking?.booking_date;

      return (
        <div className="text-sm">
          <p className="font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            {booking?.field?.name || "Lap. Tidak Ditemukan"}
          </p>
          <p className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date || "Tanggal TBD"}
          </p>
        </div>
      );
    },
    enableSorting: false,
  },

  // --- KOLOM BARU: JAM MAIN ---
  {
    id: "time_duration",
    header: "Jam Main",
    cell: ({ row }) => {
      const slots = row.original.booking?.booked_slots;
      const { startTime, endTime, duration } = getPlayTime(slots);

      return (
        <div className="text-sm font-medium">
          {startTime && endTime ? (
            <>
              {startTime} - {endTime}
              <span className="text-xs text-muted-foreground ml-1">
                ({duration} jam)
              </span>
            </>
          ) : (
            "TBD"
          )}
        </div>
      );
    },
    enableSorting: false,
  },

  // --- Kolom Slot ---
  {
    accessorKey: "slots_total",
    header: "Slot",
    cell: ({ row }) => {
      const total = row.getValue("slots_total") as number;
      const filled = row.original.participants_count || 0; // Dari withCount
      const available = total - filled;

      return (
        <div
          className={`font-semibold ${
            available <= 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {available}/{total}
        </div>
      );
    },
    enableSorting: true,
  },

  // --- Kolom Harga ---
  {
    accessorKey: "price_per_slot",
    header: "Pendaftaran",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatRupiah(row.getValue("price_per_slot"))}
      </div>
    ),
    enableSorting: true,
  },
 

  // 4. Kolom Status Sesi (BARU)
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status Sesi
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const mabar = row.original;

      // Asumsi data booking.status di-load: 'active', 'waiting_payment', 'failed', 'cancelled'
      const bookingStatus = mabar.booking?.booked_status;
      let text = "N/A";
      let badgeStyle = "bg-gray-600/20 text-gray-400";

      if (bookingStatus === "active") {
        text = "LUNAS / AKTIF";
        badgeStyle = "bg-green-600/20 text-green-500";
      } else if (bookingStatus === "waiting_payment") {
        text = "MENUNGGU BAYAR";
        badgeStyle = "bg-orange-600/20 text-orange-500";
      } else if (bookingStatus === "failed" || bookingStatus === "cancelled") {
        text = "DIBATALKAN";
        badgeStyle = "bg-red-600/20 text-red-500";
      }

      return (
        <Badge
          variant={bookingStatus === "active" ? "default" : "secondary"}
          className={badgeStyle + " hover:bg-opacity-30 font-semibold"}
        >
          {text}
        </Badge>
      );
    },
    enableSorting: true,
  },

  // --- Kolom Aksi ---
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const mabar = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href={`/admin/mabar/${mabar.id}`}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail Sesi
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onEdit(mabar)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" /> Ubah Detail
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(mabar)}
              className="text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Batalkan Sesi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
