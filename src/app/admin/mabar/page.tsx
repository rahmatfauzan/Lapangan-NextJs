"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { mabarFetcher } from "@/lib/services/mabar.service"; // Ganti categoryFetcher menjadi mabarFetcher
import { DataTable } from "@/components/data-table";
import type { PaginatedResponse, MabarSession, FilterTab } from "@/types";
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
import { createMabarColumns } from "./columns-mabar"; // Ganti columns-category menjadi columns-mabar

const MabarFilterTabs: FilterTab[] = [
  { label: "Aktif", value: "active" },
  { label: "Menunggu Pembayaran", value: "waiting_payment" },
  { label: "Batal", value: "failed" },
  { label: "Gagal", value: "cancelled" },
];
// Halaman utama untuk mengelola sesi mabar
export default function MabarPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilter] = useDebounce(filterValue, 500);
  

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedMabar, setSelectedMabar] = useState<MabarSession | null>(null);

  const { mutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);
  const swrKeyPrefix = "/api/mabar-sessions"; // Ganti 'sport-categories' menjadi 'mabar-sessions'

  const statusFilter = activeTab === "all" ? "" : `&status=${activeTab}`;
  const searchFilter = debouncedFilter ? `&title=${debouncedFilter}` : "";
  const swrKey = `${swrKeyPrefix}?page=${page}${statusFilter}${searchFilter}`;

  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<MabarSession>>(swrKey, mabarFetcher);
  const data = paginatedData?.data ?? [];

  useEffect(() => {
    setPage(1);
  }, [debouncedFilter, activeTab]);



  const handleEditClick = (mabar: MabarSession) => {
    setSelectedMabar(mabar);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (mabar: MabarSession) => {
    setSelectedMabar(mabar);
    setIsDeleteDialogOpen(true);
  };

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

  const columns = createMabarColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Manajemen Sesi Mabar</h1>
        <Button asChild>
          <Link href="/admin/mabar/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Sesi Mabar
          </Link>
        </Button>
      </div>

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
          filterPlaceholder="Filter nama sesi mabar..."
          activeTab={activeTab}
          filterTabs={MabarFilterTabs}
          onTabChange={handleTabChange}
        />
      </div>

    </div>
  );
}
