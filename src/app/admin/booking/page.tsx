"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";

// --- Import Service Kategori ---
import { categoryFetcher, deleteCategory } from "@/lib/services/category.service";

// --- Import Kolom Kategori ---
import { DataTable } from "@/components/data-table";
import type { Booking, FilterTab, PaginatedResponse, SportCategory } from "@/types"; 
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

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

import { bookingFetcher } from "@/lib/services/booking.service";
import { createBookingColumns } from "@/app/admin/booking/columns-booking";

// --- Filter Tabs for Categories ---
const categoryFilterTabs: FilterTab[] = [
  { label: "Aktif", value: "active" },
  { label: "Menunggu Bayar", value: "waiting_payment" },
  { label: "Failed", value: "failed" },
  { label: "Cancel", value: "cancelled" },
];

export default function SportCategoriesPage() {
  // --- State for Modals ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- Category State ---
  const [selectedCategory, setSelectedCategory] = useState<SportCategory | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // --- State for Pagination & Filter ---
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilter] = useDebounce(filterValue, 500);

  // --- Table State ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { mutate } = useSWRConfig();
  const swrKeyPrefix = "/api/admin/bookings"; // Admin API URL

  // --- SWR Key Dynamic Configuration ---
  const statusFilter = activeTab === "all" ? "" : `&status=${activeTab}`;
  const searchFilter = debouncedFilter ? `&name=${debouncedFilter}` : "";
  const swrKey = `${swrKeyPrefix}?page=${page}${statusFilter}${searchFilter}`;

  // --- SWR Data Fetching ---
  const { data: paginatedData, error, isLoading } = useSWR<PaginatedResponse<Booking>>(swrKey, bookingFetcher);
  const data = paginatedData?.data ?? [];

  // --- Reset page when filter changes ---
  useEffect(() => {
    setPage(1);
  }, [debouncedFilter, activeTab]);

  // --- Handlers for Edit/Confirm Delete ---
  const onEditSuccess = () => {
    setIsEditDialogOpen(false);
    mutate((key) => typeof key === "string" && key.startsWith(swrKeyPrefix), undefined, { revalidate: true });
  };

  const onConfirmDelete = async () => {
    if (!selectedCategory) return;
    setIsMutating(true);
    try {
      await deleteCategory(selectedCategory.id); // Call to delete category
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

  // --- Table Columns ---
  const columns = createBookingColumns({
    // Columns configuration for categories (can be reused or adapted)
  });

  // --- Initialize React Table ---
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Manajemen Kategori</h1>
        <Button asChild>
          <Link href="/admin/booking/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Booking
          </Link>
        </Button>
      </div>

      {/* DataTable Component */}
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
          filterPlaceholder="Filter nama pemesan..."
          activeTab={activeTab}
          onTabChange={handleTabChange}
          filterTabs={categoryFilterTabs}
        />
      </div>

      {/* Edit and Delete Modals */}
      {/* Edit Modal */}
      {/* <FieldEditModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedField={selectedCategory as any}
        title="Edit Kategori"
        customDescription="Perbarui nama atau ikon untuk kategori ini."
      >
        {selectedCategory && (
          <CategoryForm initialData={selectedCategory} onSuccess={onEditSuccess} />
        )}
      </FieldEditModal> */}

      {/* Delete Modal */}
      {/* <FieldDeleteModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedField={selectedCategory as any}
        swrKeyPrefix={swrKeyPrefix}
        onConfirm={onConfirmDelete}
        isMutating={isMutating}
      /> */}
    </div>
  );
}
