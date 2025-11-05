"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fieldFetcher } from "@/lib/services/field.service";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";

// --- 1. IMPORT KOMPONEN REUSABLE ---
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"; // (Sesuaikan path)
// -------------------------------------

export default function UserPage() {
  // --- 2. DEFINISIKAN DATA BREADCRUMB ---
  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Manajemen Lapangan" },
  ];
  // ---------------------------------------

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* --- 3. PANGGIL KOMPONEN REUSABLE --- */}
      <AdminBreadcrumb items={breadcrumbItems} />

      {/* --- Header Halaman --- */}
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

      {/* --- Panggil Komponen DataTable --- */}
      <div className="grid grid-cols-1">
        <DataTable
          columns={columns}
          fetcher={fieldFetcher}
          fetchUrl="/api/admin/fields"
          filterColumnId="name"
          filterPlaceholder="Filter nama lapangan..."
        />
      </div>
    </div>
  );
}
