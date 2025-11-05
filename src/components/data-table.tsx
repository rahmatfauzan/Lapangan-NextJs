"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  Table as TanstackTable, // Ganti nama agar tidak bentrok
  VisibilityState,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import type { PaginatedResponse, PaginationLinks, PaginationMeta, FilterTab } from "@/types";

// --- Props (Menerima semua state dan handler dari Parent) ---
interface DataTableProps<TData, TValue> {
  table: TanstackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  error: string | null;
  
  // Props Filter/Tab (Untuk rendering UI dan passing state)
  filterValue: string;
  onFilterChange: (newValue: string) => void;
  filterPlaceholder: string;
  filterTabs?: FilterTab[];
  activeTab: string;
  onTabChange: (newValue: string) => void;

  // Props Paginasi (Untuk rendering UI)
  paginationMeta: PaginationMeta | undefined;
  paginationLinks: PaginationLinks | undefined;
  onPageChange: (newPage: number) => void;
}

export function DataTable<TData, TValue>({
  table,
  columns,
  isLoading,
  error,
  paginationMeta,
  paginationLinks,
  onPageChange,
  filterValue,
  onFilterChange,
  filterPlaceholder,
  filterTabs,
  activeTab,
  onTabChange,
}: DataTableProps<TData, TValue>) {
  
  // HAPUS SEMUA LOGIC SWR, DEBOUNCE, USEEFFECT, USESTATE
  
  return (
    <Card>
      <CardContent className="pt-6"> 
        
        {/* Render Tab Filter (Menggunakan props) */}
        {filterTabs && filterTabs.length > 0 && (
          <div className="flex space-x-1 border-b mb-4">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => onTabChange("all")}
              className="rounded-b-none"
            >
              Semua
            </Button>
            {filterTabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "ghost"}
                onClick={() => onTabChange(tab.value)}
                className="rounded-b-none"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        )}
        
        {/* Render Filter Input (Menggunakan props) */}
        <div className="flex items-center py-4">
          <Input
            placeholder={filterPlaceholder}
            value={filterValue} 
            onChange={(event) => onFilterChange(event.target.value)} 
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace("_", " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* --- Render Tabel --- */}
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">
                    {error as string}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Render Paginasi */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getRowModel().rows.length} baris ditampilkan. Total:{" "}
            {paginationMeta?.total ?? 0} data.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((paginationMeta?.current_page ?? 1) - 1)}
              disabled={!paginationLinks?.prev}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((paginationMeta?.current_page ?? 1) + 1)}
              disabled={!paginationLinks?.next}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}