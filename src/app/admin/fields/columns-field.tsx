"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CalendarIcon,
  Clock,
  Edit,
  MoreHorizontal,
  Trash2,
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
import type { Field } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

// ... (Helper formatRupiah) ...

// --- UBAH JADI FUNGSI YANG MENERIMA PROPS ---
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

// --- UBAH JADI FUNGSI YANG MENERIMA PROPS ---
export const createFieldColumns = ({
  onEdit,
  onDelete,
  onEditHours,
  onBlockSchedule,
}: {
  onEdit: (field: Field) => void;
  onDelete: (field: Field) => void;
  onEditHours: (field: Field) => void;
  onBlockSchedule: (field: Field) => void;
}): ColumnDef<Field>[] => [
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
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Lapangan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const field = row.original;
      const name = field.name;
      const imageUrl = field.field_photo;
      const fallback = name.substring(0, 2).toUpperCase();

      return (
        // 6. Gunakan flexbox untuk menatanya
        <div className="flex items-center gap-3">
          <Avatar className="h-3 w-3">
            <AvatarImage src={imageUrl || ""} alt={name} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    id: "sport_category",
    accessorFn: (row) => row.sport_category?.name ?? "N/A",
    header: "Kategori",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("status") === "active" ? "blue" : "destructive"}
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "price_weekday",
    header: () => <div className="text-right">Harga Weekday</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatRupiah(row.getValue("price_weekday"))}
      </div>
    ),
  },
  {
    accessorKey: "price_weekend",
    header: () => <div className="text-right">Harga Weekend</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatRupiah(row.getValue("price_weekend"))}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const field = row.original;

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

            <DropdownMenuItem
              onClick={() => onEdit(field)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" /> Ubah Detail
            </DropdownMenuItem>

            {/* --- 4. TAMBAHKAN MENU ITEM BARU --- */}
            <DropdownMenuItem
              onClick={() => onEditHours(field)} // <-- Panggil handler baru
              className="cursor-pointer"
            >
              <Clock className="mr-2 h-4 w-4" /> Atur Jam Buka
            </DropdownMenuItem>
            {/* ---------------------------------- */}
            <DropdownMenuItem
              onClick={() => onBlockSchedule(field)}
              className="cursor-pointer"
            >
              <CalendarIcon className="mr-2 h-4 w-4" /> Blokir Jadwal
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(field)}
              className="text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Lapangan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
