"use client";
import { useEffect, useState } from "react";

// Fungsi dekripsi Laravel cookie (gunakan fungsi yang Anda buat sebelumnya)
import { decryptLaravelCookie } from "@/lib/laravelCookie"; // Sesuaikan pathnya dengan lokasi fungsi Anda
import { set } from "date-fns";

export default function UnauthorizedPage() {
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

    // Cookie terenkripsi yang ingin Anda dekode
    const encryptedCookie = "eyJpdiI6Imx6ek9rd05ZMGxJQm8ralpxRWNrblE9PSIsInZhbHVlIjoiNFNlVmdkMklKNXprTDR3dEd4TUlnZkFKQ2FDN1BoUU4yMTZ5ME1qT1RHS3Q1SkZRYkZDR3RFZFFXVm4xYmtDTiIsIm1hYyI6IjAxODA4MDNlNzNjNzZiOTViYzNkMDkwNjkxMDExMzM4YzFkNjNiZDU5NDQxMDg2NGIxNTYxMjJmZWQ1MDkxMzUiLCJ0YWciOiIifQ=="; // Gantilah dengan nilai cookie yang benar
    const appKey = "base64:KV9Ioj6KX7Inoc74ExslxFIvYpP1SYksiDQPQXd0KGs="; // Gantilah dengan APP_KEY dari .env Laravel

    // Panggil fungsi dekripsi dan tangani hasilnya
    const result = decryptLaravelCookie(encryptedCookie, appKey);

  return (
    <div>
      <div>
        {result}
      </div>
    </div>
  );
}
