"use client";

import { icons } from "lucide-react";
import type { LucideProps } from "lucide-react";

// Tipe props untuk komponen ikon dinamis
interface DynamicIconProps extends LucideProps {
  name: string; // Nama ikon, cth: "Activity"
}

/**
 * Komponen ini me-render ikon Lucide berdasarkan 'name' prop.
 * Ini adalah cara aman untuk me-render <IconComponent /> dari string.
 */
export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // Ambil komponen ikon dari 'icons' map (pustaka lucide)
  const IconComponent = (icons as any)[name];

  if (!IconComponent) {
    // Fallback jika nama ikon salah atau tidak ditemukan
    // (Ganti '?' dengan ikon default jika mau)
    return <span className="h-4 w-4">?</span>; 
  }

  // Render komponen ikon yang ditemukan (cth: <Activity />)
  return <IconComponent {...props} />;
};