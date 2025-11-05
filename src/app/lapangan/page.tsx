"use client";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SportCategory {
  id: number;
  name: string;
  icon: string | null;
}

interface Lapangan {
  id: number;
  name: string;
  description: string;
  status: string;
  field_photo: string | null;
  price_weekday: number;
  price_weekend: number;
  sport_category: SportCategory;
}

interface ApiResponse {
  data: Lapangan[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function LapanganPage() {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    "http://127.0.0.1:8000/api/fields",
  );

  if (isLoading) return <div className="container m-auto p-4">Loading...</div>;
  if (error)
    return <div className="container m-auto p-4">Gagal memuat data...</div>;
  if (!data || !data.data || data.data.length === 0) {
    return <div className="container m-auto p-4">Tidak ada data lapangan.</div>;
  }

  return (
    <main className="container m-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Data Lapangan</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.data.map((lapangan) => (
          <Card key={lapangan.id} className="flex flex-col justify-between">
            <div>
              <CardHeader>
                {lapangan.field_photo ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${lapangan.field_photo}`}
                    alt={lapangan.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                ) : (
                  <div className="w-full h-40 bg-secondary rounded-md flex items-center justify-center text-muted-foreground mb-4">
                    Foto tidak tersedia
                  </div>
                )}
                <CardTitle>{lapangan.name}</CardTitle>
                <CardDescription>{lapangan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Kategori: {lapangan.sport_category.name}
                </p>
                <p className="font-semibold">Harga:</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Hari Kerja: {formatCurrency(lapangan.price_weekday)}</li>
                  <li>Akhir Pekan: {formatCurrency(lapangan.price_weekend)}</li>
                </ul>
              </CardContent>
            </div>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/lapangan/detail/${lapangan.id}`}>
                  Lihat Detail
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
