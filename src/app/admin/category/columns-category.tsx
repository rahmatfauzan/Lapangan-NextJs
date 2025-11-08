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
import type { Field, SportCategory } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

// Tipe Props untuk fungsi (agar bisa memanggil handler di 'page.tsx')

export const createCategoryColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (category: SportCategory) => void;
  onDelete: (category: SportCategory) => void;
}): ColumnDef<SportCategory>[] => [
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

  // --- Kolom Ikon ---
  {
    accessorKey: "icon",
    header: "Ikon",
    cell: ({ row }) => {
      const iconName = row.getValue("icon") as string;
      if (!iconName) return null;

      // Render komponen ikon dinamis
      return (
        // <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
          <DynamicIcon name={iconName} className="h-4 w-4" />
        // </div>
      );
    },
    enableSorting: false,
  },
  // -------------------

  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Kategori
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },

  // --- Kolom Aksi ---
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const category = row.original;
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
              onClick={() => onEdit(category)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" /> Ubah
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
