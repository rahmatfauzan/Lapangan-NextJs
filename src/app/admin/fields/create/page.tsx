// app/admin/fields/create/page.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"; // Asumsi komponen Breadcrumb sudah dibuat
import { FieldForm } from "./field-create-form";

export default function FieldCreatePage() {
  // Definisi Breadcrumb
  const breadcrumbItems = [
    { label: "Manajemen Lapangan", href: "/admin/fields" },
    { label: "Tambah Baru" },
  ];

  // Handler Submit (form ini akan menggunakan onSubmit dari react-hook-form)
  const handleFormSubmit = (data: FormData) => {
    // Logika pengiriman data akan dihandle di dalam FieldCreateForm
    console.log("Form submitted from parent:", data);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Tambah Lapangan Baru
        </h1>
      </div>
      <AdminBreadcrumb items={breadcrumbItems} />

      {/* Card untuk form */}
      <div className="">
        <FieldForm/>
      </div>
    </div>
  );
}
