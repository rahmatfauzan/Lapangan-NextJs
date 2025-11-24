"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, MapPin, FilterX } from "lucide-react";
import { Field, SportCategory, PaginatedResponse } from "@/types";
import useSWR from "swr";
import { categoryFetchernoPaginate } from "@/lib/services/category.service";
import { fieldFetcher } from "@/lib/services/field.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import { formatRupiah } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const sportColors: Record<string, string> = {
  Basketball: "bg-orange-500",
  Futsal: "bg-green-500",
  Badminton: "bg-blue-500",
  Tennis: "bg-yellow-500",
  Volleyball: "bg-purple-500",
  Soccer: "bg-emerald-600",
};

// 1. Separate the main content logic
function FieldPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [selectedSport, setSelectedSport] = useState(categoryFromUrl || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);

  // Sync URL when filter changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedSport(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedSport, debouncedSearch]);

  // Fetch Categories
  const { data: categories } = useSWR<SportCategory[]>(
    "/api/sport-categories",
    categoryFetchernoPaginate,
    { revalidateOnFocus: false }
  );

  // Construct Query Key
  const sportFilter =
    selectedSport === "all" ? "" : `&sport_category_id=${selectedSport}`;
  const searchFilter = debouncedSearch ? `&name=${debouncedSearch}` : "";
  const swrKey = `/api/fields?page=${page}${sportFilter}${searchFilter}`;

  const {
    data: paginatedData,
    error: fieldsError,
    isLoading: isFieldsLoading,
  } = useSWR<PaginatedResponse<Field>>(swrKey, fieldFetcher, {
    keepPreviousData: true, // UX improvement: Keep showing old data while fetching new page
  });

  const filteredFields = paginatedData?.data ?? [];

  const clearFilters = () => {
    setSelectedSport("all");
    setSearchQuery("");
    router.push("/field", { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 sticky top-4 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama lapangan atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-64">
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full h-12 border-gray-200">
                <SelectValue placeholder="Jenis Olahraga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Olahraga</SelectItem>
                {categories?.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id.toString()}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Daftar Lapangan{" "}
          <span className="text-gray-400 font-normal text-base ml-2">
            ({paginatedData?.meta?.total ?? 0} ditemukan)
          </span>
        </h2>
      </div>

      {/* Content Grid */}
      <div className="min-h-[400px]">
        {isFieldsLoading && !paginatedData ? (
          <FieldsSkeleton />
        ) : fieldsError ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-red-200">
            <p className="text-red-500 font-medium">
              Gagal memuat data lapangan.
            </p>
            <Button
              variant="outline"
              className="mt-4 text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </Button>
          </div>
        ) : filteredFields.length === 0 ? (
          <EmptyState onReset={clearFilters} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredFields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {paginatedData?.meta && paginatedData.meta.last_page > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFieldsLoading}
            className="hover:bg-orange-50 hover:text-orange-600"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 font-medium text-gray-600 bg-white border rounded-md">
            Page {page} of {paginatedData.meta.last_page}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === paginatedData.meta.last_page || isFieldsLoading}
            className="hover:bg-orange-50 hover:text-orange-600"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// 2. Refactored Field Card Component
const FieldCard = ({ field }: { field: Field }) => {
  const categoryName = field.sport_category?.name || "Lainnya";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col bg-white">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={
              field.field_photo ||
              "https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image"
            }
            alt={field.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-60" />

          <Badge
            className={`absolute top-3 left-3 ${
              sportColors[categoryName] || "bg-gray-600"
            } text-white border-none shadow-sm font-medium`}
          >
            {categoryName}
          </Badge>
          <Badge
            variant={field.status === "active" ? "default" : "destructive"}
            className={`absolute top-3 right-3 ${
              field.status === "active" ? "bg-emerald-500" : "bg-red-500"
            } border-none shadow-sm`}
          >
            {field.status === "active" ? "Available" : "Maintenance"}
          </Badge>
        </div>

        {/* Content Section */}
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-1 line-clamp-1 text-gray-900 group-hover:text-orange-600 transition-colors">
              {field.name}
            </h3>
          </div>

          <div className="space-y-2 mb-6 flex-grow">
            <PriceRow
              label="Weekday"
              price={field.price_weekday}
              color="text-gray-900"
              bgColor="bg-gray-100"
            />
            <PriceRow
              label="Weekend"
              price={field.price_weekend}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all"
            disabled={field.status !== "active"}
            asChild
          >
            <Link href={`/field/${field.id}`}>
              {field.status === "active"
                ? "Booking Sekarang"
                : "Tidak Tersedia"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper Component for Price
const PriceRow = ({
  label,
  price,
  color,
  bgColor,
}: {
  label: string;
  price: number;
  color: string;
  bgColor: string;
}) => (
  <div className="flex items-center justify-between group/price">
    <span
      className={`text-xs font-medium px-2 py-1 rounded ${bgColor} text-gray-600`}
    >
      {label}
    </span>
    <div className="text-right">
      <span className={`text-base font-bold ${color}`}>
        {formatRupiah(price)}
      </span>
      <span className="text-gray-400 text-[10px] ml-1">/jam</span>
    </div>
  </div>
);

// Loading Skeleton
const FieldsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
        <Skeleton className="h-48 w-full" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ onReset }: { onReset: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200"
  >
    <div className="bg-orange-50 p-4 rounded-full mb-4">
      <FilterX className="w-10 h-10 text-orange-500" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      Tidak ada lapangan ditemukan
    </h3>
    <p className="text-gray-500 text-center max-w-md mb-6">
      Kami tidak dapat menemukan lapangan yang cocok dengan pencarian atau
      filter Anda. Coba kata kunci lain.
    </p>
    <Button
      onClick={onReset}
      className="bg-orange-500 hover:bg-orange-600 text-white"
    >
      Reset Semua Filter
    </Button>
  </motion.div>
);

// 3. Main Export with Suspense
export default function FieldPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay" />
        <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-white/20 hover:bg-white/30 text-white mb-4 backdrop-blur-sm border-none">
              Explore Arena
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Temukan Lapangan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-100">
                Olahraga Terbaik
              </span>
            </h1>
            <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
              Platform booking lapangan olahraga #1. Cek jadwal real-time,
              bandingkan harga, dan booking langsung tanpa ribet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content wrapped in Suspense */}
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <FieldsSkeleton />
          </div>
        }
      >
        <FieldPageContent />
      </Suspense>
    </div>
  );
}
