"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { fieldFetcher, deleteField } from "@/lib/services/field.service";
import { createFieldColumns } from "./columns-field";
import { DataTable } from "@/components/data-table"; // DataTable & FilterTab
import type { Field, FilterTab, PaginatedResponse } from "@/types";
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
  ColumnFiltersState,
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
import { FieldEditModal } from "@/components/modal/modal-edit";
import { FieldDeleteModal } from "@/components/modal/modal-delete";
import { FieldForm } from "./create/field-create-form"; // Ganti nama jika ini form gabungan
import { FieldHoursForm } from "./fieldHours-edit-form";
import { FieldBlockForm } from "./field-block-form";

// Definisikan Tab untuk Lapangan
const fieldFilterTabs: FilterTab[] = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

export default function FieldsPage() {
  // --- State Modal ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditHoursDialogOpen, setIsEditHoursDialogOpen] = useState(false);
  const [isBlockFieldDialogOpen, setIsBlockFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
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
  const swrKeyPrefix = "/api/fields"; // Gunakan URL Admin yang benar

  // --- SWR Key Dinamis ---
  const statusFilter = activeTab === "all" ? "" : `&status=${activeTab}`;
  const searchFilter = debouncedFilter ? `&name=${debouncedFilter}` : "";
  const swrKey = `${swrKeyPrefix}?page=${page}${statusFilter}${searchFilter}`;

  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<Field>>(swrKey, fieldFetcher);
  const data = paginatedData?.data ?? [];

  // Reset halaman jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedFilter, activeTab]);

  // --- HANDLER SINKRONISASI PASCA-EDIT/DELETE ---
  const onEditSuccess = (updatedFieldName: string) => {
    setIsEditDialogOpen(false);
    mutate(
      (key) => typeof key === "string" && key.startsWith(swrKeyPrefix),
      undefined,
      { revalidate: true }
    );
    toast.success("Sukses!", {
      description: `Data lapangan "${updatedFieldName}" berhasil diperbarui.`,
    });
  };

  const onConfirmDelete = async () => {
    if (!selectedField) return;
    setIsMutating(true);
    try {
      await deleteField(selectedField.id);
      mutate(
        (key) => typeof key === "string" && key.startsWith(swrKeyPrefix),
        undefined,
        { revalidate: true }
      );
      toast.success("Sukses!", {
        description: `Lapangan "${selectedField.name}" berhasil dihapus.`,
      });
    } catch (err) {
      toast.error("Gagal Hapus", { description: "Gagal menghapus data." });
    } finally {
      setIsMutating(false);
      setIsDeleteDialogOpen(false);
      setSelectedField(null);
    }
  };

  const onHoursUpdate = () => {
    setIsEditHoursDialogOpen(false);
    toast.success("Sukses!", {
      description: `Jam operasional berhasil diperbarui.`,
    });
  };

  const onBlock = () => {
    setIsBlockFieldDialogOpen(false);
    toast.success("Sukses!", { description: `Jadwal berhasil diblokir.` });
  };

  // --- Handlers Modal & Action ---
  const handleEditClick = (field: Field) => {
    setSelectedField(field);
    setIsEditDialogOpen(true);
  };
  const handleDeleteClick = (field: Field) => {
    setSelectedField(field);
    setIsDeleteDialogOpen(true);
  };
  const handleEditHoursClick = (field: Field) => {
    setSelectedField(field);
    setIsEditHoursDialogOpen(true);
  };
  const handleBlockScheduleClick = (field: Field) => {
    setSelectedField(field);
    setIsBlockFieldDialogOpen(true);
  };
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

  // --- Buat Kolom ---
  const columns = createFieldColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onEditHours: handleEditHoursClick,
    onBlockSchedule: handleBlockScheduleClick,
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
          Manajemen Lapangan
        </h1>
        <Button asChild>
          <Link href="/admin/fields/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Lapangan
          </Link>
        </Button>
      </div>

      {/* --- Panggil Komponen DataTable "Bodoh" --- */}
      <div className="grid grid-cols-1">
        <DataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          error={error ? "Gagal memuat data." : null}
          // --- KIRIM SEMUA PROPS FILTER/PAGINASI KE ANAK ---
          paginationMeta={paginatedData?.meta}
          paginationLinks={paginatedData?.links}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
          filterValue={filterValue}
          onFilterChange={setFilterValue}
          filterPlaceholder="Filter nama lapangan..."
          activeTab={activeTab}
          onTabChange={handleTabChange}
          filterTabs={fieldFilterTabs}
        />
      </div>

      {/* --- Modal Edit Reusable --- */}
      <FieldEditModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedField={selectedField}
        tittle="Update Lapangan"
        customDescription="Perbarui detail harga dan status lapangan ini."
      >
        {selectedField && (
          <FieldForm
            initialData={selectedField}
            onSuccess={() => onEditSuccess(selectedField.name)}
          />
        )}
      </FieldEditModal>

      {/* --- Modal Edit Jam Operasional --- */}
      <FieldEditModal
        open={isEditHoursDialogOpen}
        onOpenChange={setIsEditHoursDialogOpen}
        selectedField={selectedField}
        tittle="Atur Jam Operasional"
        customDescription="Perbarui detail jam operasional lapangan ini."
      >
        {selectedField && (
          <FieldHoursForm field={selectedField} onSuccess={onHoursUpdate} />
        )}
      </FieldEditModal>

      {/* --- Modal Blokir Jadwal --- */}
      <FieldEditModal
        open={isBlockFieldDialogOpen}
        onOpenChange={setIsBlockFieldDialogOpen}
        selectedField={selectedField}
        tittle="Blokir Jadwal"
        customDescription="Tutup lapangan pada tanggal dan jam tertentu."
      >
        {selectedField && (
          <FieldBlockForm field={selectedField} onSuccess={onBlock} />
        )}
      </FieldEditModal>

      {/* --- Modal Delete Reusable --- */}
      <FieldDeleteModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedField={selectedField}
        swrKeyPrefix={swrKeyPrefix}
        onConfirm={onConfirmDelete}
        isMutating={isMutating}
      />
    </div>
  );
}
