"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { userFetcher, deleteUser } from "@/lib/services/user.service"; // Adjusted the service import
import { DataTable } from "@/components/data-table"; // DataTable & FilterTab
import type { User, FilterTab, PaginatedResponse } from "@/types"; // Adjusted types for users
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Import TanStack Table Hooks ---
import {
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
// ------------------------------------

// --- Import Modal Components ---
import { DeleteModal } from "@/components/modal/modal-delete";
import { EditModal } from "@/components/modal/modal-edit";
import { createUsersColumns } from "./columns";
import { UserForm } from "./UserEditForm";

export default function UsersPage() {
  // --- State Modal ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // --- State Paginasi & Filter ---
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilter] = useDebounce(filterValue, 500);

  // --- State Tabel ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { mutate } = useSWRConfig();
  const swrKeyPrefix = "/api/admin/users"; // URL for user data

  // --- SWR Key Dinamis ---
  const statusFilter = activeTab === "all" ? "" : `&status=${activeTab}`;
  const searchFilter = debouncedFilter ? `&name=${debouncedFilter}` : "";
  const swrKey = `${swrKeyPrefix}?page=${page}${statusFilter}${searchFilter}`;

  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<User>>(swrKey, userFetcher);
  const data = paginatedData?.data ?? [];

  // Reset halaman jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedFilter, activeTab]);

  // --- HANDLER SINKRONISASI PASCA-EDIT/DELETE ---
  const onEditSuccess = (updatedUserName: string) => {
    setIsEditDialogOpen(false);
    mutate(
      (key) => typeof key === "string" && key.startsWith(swrKeyPrefix),
      undefined,
      { revalidate: true }
    );
    toast.success("Sukses!", {
      description: `Data pengguna "${updatedUserName}" berhasil diperbarui.`,
    });
  };

  const onConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsMutating(true);
    try {
      await deleteUser(selectedUser.id); // Updated the delete function
      mutate(
        (key) => typeof key === "string" && key.startsWith(swrKeyPrefix),
        undefined,
        { revalidate: true }
      );
      toast.success("Sukses!", {
        description: `Pengguna "${selectedUser.name}" berhasil dihapus.`,
      });
    } catch (err) {
      toast.error("Gagal Hapus", { description: "Gagal menghapus data." });
    } finally {
      setIsMutating(false);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // --- Handlers Modal & Action ---
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // --- Buat Kolom ---
  const columns = createUsersColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  // --- INISIALISASI USE REACT TABLE ---
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    pageCount: paginatedData?.meta.last_page ?? -1,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,

    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: paginatedData?.meta.per_page ?? 10,
      },
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manajemen Pengguna
        </h1>

        <Button asChild>
          <Link href="/admin/users/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna
          </Link>
        </Button>
      </div>

      {/* --- Panggil Komponen DataTable --- */}
      <div className="grid grid-cols-1">
        <DataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          error={error ? "Gagal memuat data." : null}
          paginationMeta={paginatedData?.meta}
          paginationLinks={paginatedData?.links}
          onPageChange={(newPageIndex) => setPage(newPageIndex)}
          filterValue={filterValue}
          onFilterChange={setFilterValue}
          filterPlaceholder="Filter nama pengguna..."
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <EditModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selected={selectedUser}
        tittle="Atur Jam Operasional"
        customDescription="Perbarui detail jam operasional lapangan ini."
      >
        {selectedUser && (
          <UserForm initialData={selectedUser} onSuccess={onEditSuccess} />
        )}
      </EditModal>

      {/* --- Modal Delete Reusable --- */}
      <DeleteModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selected={selectedUser}
        swrKeyPrefix={swrKeyPrefix}
        onConfirm={onConfirmDelete}
        isMutating={isMutating}
      />
    </div>
  );
}
