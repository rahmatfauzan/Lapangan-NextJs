// app/admin/users/columns-user.tsx (File Baru)

"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  MoreHorizontal,
  Trash2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types";
import { format } from "date-fns";

interface CreateUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const createUsersColumns = ({
  onEdit,
  onDelete,
}: CreateUserColumnsProps): ColumnDef<User>[] => [
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

  // 1. Kolom Nama & Avatar
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Pengguna
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const user = row.original;
      const fallback = user.name.substring(0, 2).toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{user.name}</div>
        </div>
      );
    },
  },

  // 2. Kolom Kontak
  {
    id: "contact",
    header: "Kontak",
    cell: ({ row }) => (
      <div className="text-sm space-y-1">
        <p className="flex items-center gap-1 text-muted-foreground">
          <Mail className="h-3 w-3" /> {row.original.email}
        </p>
        <p className="flex items-center gap-1 text-muted-foreground">
          <Phone className="h-3 w-3" /> {row.original.phone || "N/A"}
        </p>
      </div>
    ),
    enableSorting: false,
  },

  // 3. Kolom Peran (Role)
  {
    id: "role",
    accessorFn: (row) => row?.roles?.[0] ?? "user", // Asumsi satu peran utama
    header: "Peran",
    cell: ({ row }) => {
      const user = row.original;
      const role = user?.roles?.[0]?.name || 'user';
      const style =
        role === "admin"
          ? "bg-primary/20 text-primary"
          : "bg-secondary text-secondary-foreground";
      return <Badge className={style}>{role.toUpperCase()}</Badge>;
    },
    enableSorting: false,
  },

  // 4. Kolom Tanggal Daftar

  // 5. Kolom Aksi
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi User</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(user)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
