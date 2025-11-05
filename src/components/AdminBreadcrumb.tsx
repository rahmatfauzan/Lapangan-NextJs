"use client"; // Komponen ini interaktif (menggunakan Link)

import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// 1. Definisikan tipe data untuk setiap item breadcrumb
type BreadcrumbItemProps = {
  label: string;
  href?: string; // href opsional, item terakhir tidak punya href
};

// 2. Definisikan props untuk komponen utama
interface AdminBreadcrumbProps {
  items: BreadcrumbItemProps[];
}

// 3. Buat komponen reusable
export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          // React.Fragment diperlukan untuk grouping (item + separator)
          <React.Fragment key={index}>
            
            {/* 4. Logika: Cek apakah ini item TERAKHIR? */}
            {index === items.length - 1 ? (
              // Ini item terakhir, gunakan <BreadcrumbPage> (teks biasa)
              <BreadcrumbItem>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              // Ini BUKAN item terakhir, gunakan <BreadcrumbLink> (link aktif)
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.href || "#"}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {/* 5. Logika: Tambahkan separator JIKA BUKAN item terakhir */}
            {index < items.length - 1 && <BreadcrumbSeparator />}
            
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}