"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MabarForm from "./mabar-form";
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb";

export default function CreatePage() {
  const router = useRouter();
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Mabar", href: "admin/mabar" },
    { label: "Create" },
  ];

  // Handler Sukses Form
  const handleSuccess = () => {
    // Logika ini akan dipanggil setelah Mabar berhasil dibuat
    toast.success("Publikasi Berhasil!", {
      description:
        "Sesi Mabar Anda telah dibuat. Silakan selesaikan pembayaran booking.",
    });

    // Redirect ke halaman daftar sesi Mabar saya
    router.push("admin/mabar");
  };

  return (
    // Gunakan container yang responsif dan terstruktur
    <div className="p-4 md:p-8 space-y-6">
      <AdminBreadcrumb items={breadcrumbItems} />
      <Button variant="outline" asChild>
        <Link href="/admin/mabar">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Link>
      </Button>

      {/* Form Wizard */}
      <MabarForm
        onSuccess={handleSuccess} // <-- Kirim handler sukses
      />
    </div>
  );
}
