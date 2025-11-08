"use client";

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
  DollarSign,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Booking } from "@/types";
import Link from "next/link";
import { format } from "date-fns"; // Untuk format tanggal
import { getEndTime } from "@/lib/utils";

// Helper untuk format Rupiah (Asumsi ini ada di /lib/utils)
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Helper untuk Badge Status Booking
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return {
        text: "LUNAS",
        style: "bg-green-600/20 text-green-500 border border-green-600/30",
      };
    case "waiting_payment":
      return {
        text: "MENUNGGU BAYAR",
        style: "bg-orange-600/20 text-orange-500 border border-orange-600/30",
      };
    case "failed":
      return {
        text: "GAGAL",
        style: "bg-red-600/20 text-red-500 border border-red-600/30",
      };
    case "cancelled":
      return {
        text: "DIBATALKAN",
        style: "bg-gray-600/20 text-gray-400 border border-gray-600/30",
      };
    default:
      return {
        text: status.toUpperCase(),
        style: "bg-gray-600/20 text-gray-400 border border-gray-600/30",
      };
  }
};

// --- UBAH JADI FUNGSI YANG MENERIMA PROPS ---
export const createBookingColumns = ({}: // onViewDetail,
// onDelete,
{
  // onViewDetail: (booking: Booking) => void;
  // onDelete: (booking: Booking) => void;
}): ColumnDef<Booking>[] => [
  {
    id: "select",
    // ... (Kolom Checkbox)
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

  // 1. Kolom Customer & Kontak
  {
    id: "customer_info",
    header: "Pemesan & Kontak",
    cell: ({ row }) => {
      const booking = row.original;
      const name = booking.customer_name || booking.user?.name || "Tamu";
      const phone =
        booking.customer_phone || booking.user?.phone || "Kontak T/A";

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {/* Asumsi: AvatarImage tidak tersedia, gunakan fallback */}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{name}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {phone}
            </span>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },

  // 2. Kolom Lapangan & Tanggal
  {
    id: "field_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Lapangan & Tanggal
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const booking = row.original;
      const date = booking.booking_date;

      return (
        <div className="text-sm">
          <p className="font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            {booking.field?.name || "Lap. T/A"}
          </p>
          <p className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date ? format(new Date(date), "dd MMM yyyy") : "Tanggal T/A"}
          </p>
        </div>
      );
    },
    enableSorting: true,
  },

  // 3. Kolom Jam Slot
  {
    accessorKey: "booked_slots",
    header: "Jam",
    cell: ({ row }) => {
      const slots = row.getValue("booked_slots") as string[];
      const duration = slots.length;
      const startTime = slots[0];
      return (
        <div className="text-sm">
          <p className="font-medium flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {/* Tampilkan rentang waktu */}
            {startTime} - {getEndTime(startTime, duration)}
            {/* Durasi (Opsional) */}
          </p>
          <span className="text-xs text-muted-foreground ml-1">
            ({duration} jam)
          </span>
        </div>
      );
    },
    enableSorting: false,
  },

  // 4. Kolom Status Pembayaran
  {
    accessorKey: "booked_status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("booked_status") as string;
      const { text, style } = getStatusBadge(status);
      return <Badge className={style}>{text}</Badge>;
    },
  },

  // 5. Kolom Total Harga
  {
    accessorKey: "price",
    header: () => <div className="text-right">Total Harga</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-green-500">
        {formatRupiah(row.getValue("price"))}
      </div>
    ),
    enableSorting: true,
  },

  // 6. Kolom Aksi
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi Booking</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* <DropdownMenuItem onClick={() => onViewDetail(booking)}>
                            <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onDelete(booking)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Batalkan
                        </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
