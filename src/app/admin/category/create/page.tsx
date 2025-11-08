"use client";

import { CategoryForm } from "../category-form"; // <-- Path ini benar
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // <-- Import ikon "Kembali"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb";

export default function CreateCategoryPage() {
  
  // Definisikan breadcrumb untuk konteks halaman
  const breadcrumbItems = [
    { label: "Kategori Olahraga", href: "/admin/category" },
    { label: "Tambah Baru" }
  ];

  return (
    // Tambahkan layout halaman (padding, dll)
    <div className="p-4 md:p-6 space-y-4">
      
      {/* 1. Tambahkan Breadcrumb */}
      <AdminBreadcrumb items={breadcrumbItems} />
      {/* 2. Tambahkan Header Halaman */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tambah Kategori Baru
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/category">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Kategori
          </Link>
        </Button>
      </div>

      {/* 3. Render komponen <CategoryForm /> 
           (Form ini sudah memiliki <Card> di dalamnya)
      */}
      <CategoryForm 
        // Kosongkan props. 
        // Form akan otomatis masuk mode "Create" dan me-redirect 
        // setelah sukses (sesuai logic di 'onSubmit' di dalam CategoryForm).
      />
    </div>
  );
}