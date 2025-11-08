"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { categoryFetcher, deleteCategory } from "@/lib/services/category.service"; // Ganti fieldFetcher menjadi categoryFetcher
import { DataTable } from "@/components/data-table";
import type {PaginatedResponse, SportCategory } from "@/types";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { createCategoryColumns } from "./columns-category";
import { EditModal } from "@/components/modal/modal-edit";
import { DeleteModal } from "@/components/modal/modal-delete";
import { CategoryForm } from "./category-form";

// Halaman utama untuk mengelola kategori
export default function CategoriesPage() {
  // --- State Paginasi & Filter ---
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilter] = useDebounce(filterValue, 500);

  // --- Dialog States ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- Tabel States ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [selectedCategory, setSelectedCategory] = useState<SportCategory | null>(null);

  const { mutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);
  const swrKeyPrefix = "/api/sport-categories"; // Gunakan URL Admin yang benar

  // --- SWR Key Dinamis ---
  const statusFilter = activeTab === "all" ? "" : `&status=${activeTab}`;
  const searchFilter = debouncedFilter ? `&name=${debouncedFilter}` : "";
  const swrKey = `${swrKeyPrefix}?page=${page}${statusFilter}${searchFilter}`;

  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<SportCategory>>(swrKey, categoryFetcher); // Ganti fieldFetcher menjadi categoryFetcher
  const data = paginatedData?.data ?? [];

  // Reset halaman jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedFilter, activeTab]);

  // Handler untuk sukses edit
  const onEditSuccess = (updatedCategoryName: string) => {
    setIsEditDialogOpen(false);
    mutate((key) => typeof key === "string" && key.startsWith(swrKeyPrefix), undefined, { revalidate: true });
  };

  // Handler untuk konfirmasi hapus
  const onConfirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      setIsMutating(true);
      await deleteCategory(selectedCategory.id);
      mutate((key) => typeof key === "string" && key.startsWith(swrKeyPrefix), undefined, { revalidate: true });
      toast.success("Sukses!", {
        description: `Kategori "${selectedCategory.name}" berhasil dihapus.`,
      });
    } catch (err) {
      toast.error("Gagal Hapus", { description: "Gagal menghapus kategori." });
    } finally {
      setIsMutating(false);
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };


  // --- Event Handlers ---
  const handleEditClick = (category: SportCategory) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (category: SportCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

  // --- Kolom Tabel ---
  const columns = createCategoryColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  // --- Inisialisasi React Table ---
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
        <h1 className="text-2xl font-semibold tracking-tight">Manajemen Kategori</h1>
        <Button asChild>
          <Link href="/admin/category/create"> {/* Ganti 'fields' menjadi 'categories' */}
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori {/* Ganti 'Lapangan' menjadi 'Kategori' */}
          </Link>
        </Button>
      </div>

      {/* DataTable */}
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
          filterPlaceholder="Filter nama kategori..."
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Modal Edit Reusable */}
      <EditModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selected={selectedCategory} // Ganti 'selectedField' menjadi 'selectedCategory'
      >
        {selectedCategory && (
          <CategoryForm
            initialData={selectedCategory} // Ganti 'selectedField' menjadi 'selectedCategory'
            onSuccess={() => onEditSuccess(selectedCategory.name)} // Ganti 'selectedField' menjadi 'selectedCategory'
          />
        )}
      </EditModal>

      {/* Modal Hapus */}
      <DeleteModal
        open={isDeleteDialogOpen}
        customDescription="Apakah anda yakin untuk menghapus kategori ini secara permanen? Aksi ini tidak bisa dibatalkan."
        onOpenChange={setIsDeleteDialogOpen}
        selected={selectedCategory} // Ganti 'selectedField' menjadi 'selectedCategory'
        swrKeyPrefix={swrKeyPrefix}
        onConfirm={onConfirmDelete}
        isMutating={isMutating}
      />
    </div>
  );
}
