"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Users, Plus, Calendar } from "lucide-react";
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

const sportColors: Record<string, string> = {
  Basketball: "bg-orange-500",
  Futsal: "bg-green-500",
  Badminton: "bg-blue-500",
  Tennis: "bg-yellow-500",
  Volleyball: "bg-purple-500",
};

export default function FieldPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [selectedSport, setSelectedSport] = useState(categoryFromUrl || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedSport(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Fetch Data
  const { data: categories } = useSWR<SportCategory[]>(
    "/api/sport-categories",
    categoryFetchernoPaginate,
    { revalidateOnFocus: false }
  );

  const sportFilter =
    selectedSport === "all" ? "" : `&sport_category_id=${selectedSport}`;
  const searchFilter = debouncedSearch ? `&name=${debouncedSearch}` : "";
  const swrKey = `/api/fields?page=${page}${sportFilter}${searchFilter}`;

  const {
    data: paginatedData,
    error: fieldsError,
    isLoading: isFieldsLoading,
  } = useSWR<PaginatedResponse<Field>>(swrKey, fieldFetcher);

  const filteredFields = paginatedData?.data ?? [];

  const clearFilters = () => {
    setSelectedSport("all");
    setSearchQuery("");
    window.history.pushState({}, "", "/field");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 text-white py-16 md:py-20 overflow-hidden rounded-3xl mx-4 mt-4">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Cari Lapangan Olahraga
            </h1>
            <p className="text-white/90 text-base md:text-lg max-w-2xl">
              Temukan dan booking lapangan olahraga favorit Anda dengan mudah
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        {/* Filter Section */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari nama lapangan atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-14 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-custom-orange focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger
                  size="md"
                  className="w-full text-base border-gray-300"
                >
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

        {/* Tab Navigation */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between border-b border-gray-200">
            {!isFieldsLoading && (
              <p className="text-muted-foreground text-sm">
                <span className="font-semibold text-gray-900">
                  {paginatedData?.meta?.total ?? 0}
                </span>{" "}
                lapangan tersedia
              </p>
            )}
          </div>
        </motion.div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isFieldsLoading && (
            <div className="md:col-span-2 lg:col-span-4 text-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            </div>
          )}

          {fieldsError && (
            <div className="col-span-4 text-center py-16">
              <p className="text-destructive">Gagal memuat data lapangan.</p>
            </div>
          )}

          {filteredFields.map((field, index) => {
            const categoryName = field.sport_category?.name || "Lainnya";
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group h-full">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          field.field_photo ||
                          "https://placehold.co/400x300/a7f3d0/047857?text=Image"
                        }
                        alt={field.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge
                        className={`absolute top-3 left-3 ${
                          sportColors[categoryName] || "bg-gray-500"
                        } text-white border-none`}
                      >
                        {categoryName}
                      </Badge>
                      <Badge
                        className={`absolute top-3 right-3 ${
                          field.status === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        } text-white border-none`}
                      >
                        {field.status === "active" ? "Available" : "Tutup"}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 text-gray-900">
                        {field.name}
                      </h3>

                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Weekday
                          </span>
                          <div className="text-right">
                            <span className="text-xl font-bold text-orange-500">
                              {formatRupiah(field.price_weekday)}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              /jam
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                            Weekend
                          </span>
                          <div className="text-right">
                            <span className="text-xl font-bold text-orange-600">
                              {formatRupiah(field.price_weekend)}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              /jam
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-custom-orange hover:bg-orange-hover"
                        disabled={field.status !== "active"}
                        asChild
                      >
                        <Link href={`/field/${field.id}`}>
                          {field.status === "active"
                            ? "Booking Sekarang"
                            : "Tidak Tersedia"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {!isFieldsLoading && filteredFields.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">
              Tidak Ada Hasil
            </h3>
            <p className="text-muted-foreground mb-6">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
            <Button
              onClick={clearFilters}
              className="bg-custom-orange hover:bg-orange-hover"
            >
              Reset Filter
            </Button>
          </motion.div>
        )}

        {/* Pagination */}
        {(paginatedData?.links?.prev || paginatedData?.links?.next) && (
          <div className="flex justify-center mt-8 space-x-4">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={!paginatedData?.links.prev}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={!paginatedData?.links.next}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
