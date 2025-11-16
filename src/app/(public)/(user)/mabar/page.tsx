"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, DollarSign, Users, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { allFieldsFetcher, mabarFetcher } from "@/lib/services/mabar.service";
import { MabarSession, PaginatedResponse, SportCategory } from "@/types";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { formatRupiah } from "@/lib/utils";
import { categoryFetchernoPaginate } from "@/lib/services/category.service";
import Link from "next/link";
import { useRouter } from "next/navigation";

const sportColors = {
  Basketball: "bg-orange-500",
  Futsal: "bg-green-500",
  Badminton: "bg-blue-500",
  Tennis: "bg-yellow-500",
  Volleyball: "bg-purple-500",
};

const getPlayTime = (slots: string[] | undefined) => {
  if (!slots || slots.length === 0)
    return { startTime: "TBD", endTime: "", duration: 0 };
  const sortedSlots = slots.sort();
  const startTime = sortedSlots[0];
  const duration = sortedSlots.length;
  const [startHour] = startTime.split(":").map(Number);
  const endHours = startHour + duration;
  const endTime = `${endHours.toString().padStart(2, "0")}:00`;
  return { startTime, endTime, duration };
};

// Component Placeholder untuk Skeleton Loading
const MabarCardSkeleton = () => (
  <Card className="overflow-hidden border-none shadow-lg animate-pulse">
    <CardContent className="p-0">
      <div className="h-48 bg-gray-200" />
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-10" />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="bg-gray-100 rounded-lg p-3 mb-3">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="w-full bg-gray-200 rounded-full h-2" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-full" />
      </div>
    </CardContent>
  </Card>
);

export default function MabarPage() {
  const [page, setPage] = useState(1);
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const router = useRouter();
  // --- FETCH DATA ---
  const { data: categories } = useSWR<SportCategory[]>(
    "/api/sport-categories",
    categoryFetchernoPaginate,
    { revalidateOnFocus: false }
  );

  // Key Dinamis Mabar (Server-side Filtering)
  // Menggunakan 'all' untuk tidak menyertakan filter jika semua dipilih
  const sportFilter =
    selectedSport === "all" ? "" : `&sport_category_id=${selectedSport}`;
  const searchFilter = debouncedSearch ? `&name=${debouncedSearch}` : "";
  const swrKey = `/api/mabar-sessions?page=${page}${sportFilter}${searchFilter}`;

  const {
    data: paginatedData,
    error: mabarError,
    isLoading: isMabarLoading,
  } = useSWR<PaginatedResponse<MabarSession>>(swrKey, mabarFetcher);

  // Perbaikan 1: Ambil array sesi dari properti 'data' dan hitungan total
  const mabarSessions = paginatedData?.data || [];
  const totalSessions = paginatedData?.meta?.total || 0;

  console.log(mabarSessions);

  // console.log(paginatedData); // Data paginated yang benar

  const clearFilters = () => {
    setSelectedSport("all");
    setSearchQuery("");
    setPage(1); // Reset halaman ke 1
  };

  const getSlotStatus = (filled: number, total: number) => {
    const percentage = (filled / total) * 100;
    if (percentage === 100) return { text: "Penuh", color: "text-red-500" };
    if (percentage >= 80)
      return { text: "Hampir Penuh", color: "text-orange-500" };
    return { text: "Tersedia", color: "text-green-500" };
  };

  // Logika untuk menampilkan kategori dari API
  const categoryItems = [
    <SelectItem key="all" value="all">
      Semua Olahraga
    </SelectItem>,
    ...(categories || []).map((cat) => (
      // Asumsi id di API adalah string yang bisa digunakan sebagai value
      <SelectItem key={cat.id} value={String(cat.id)}>
        {cat.name}
      </SelectItem>
    )),
    // Tambahan: jika categories gagal diambil, gunakan fallback yang ada di Select
    // Items di <SelectContent> Anda harus cocok dengan data dari categories
  ];

  // Catatan: Jika data categories hanya berisi nama, Anda mungkin perlu memetakan 'name' ke 'id' atau mengubah struktur data SelectItem Anda agar konsisten.
  // Untuk saat ini, saya mengasumsikan `categories` mengembalikan objek dengan properti `id` dan `name`.

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 text-white py-16 md:py-20 overflow-hidden rounded-3xl mx-4 mt-4">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Cari Teman Mabarmu!
            </h1>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto">
              Temukan komunitas olahraga yang sesuai dengan kebutuhanmu.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* ✅ Create Mabar CTA - Positioned Here */}
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-1">
                  Cari Teman Mabar?
                </h3>
                <p className="text-white/90 text-sm md:text-base">
                  Buat event mabar dan ajak komunitas untuk bermain bersama!
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => router.push("/mabar/create")}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Mabar
            </Button>
          </div>
        </motion.div>
        {/* Filter Section */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8 max-w-full mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Bar & Category Filter */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Search Bar */}
            <div className="flex flex-grow">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari nama mabar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-14 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-custom-orange focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="h-12 w-full" size="md">
                  <SelectValue placeholder="Jenis Olahraga" />
                </SelectTrigger>
                <SelectContent>
                  {/* Perbaikan 2: Menggunakan data categories dari SWR (atau fallback list jika data belum ada/error) */}
                  {categoryItems}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Menampilkan{" "}
            <span className="font-semibold text-gray-900">
              {/* Perbaikan 3: Menggunakan hitungan total dari data paginated */}
              {totalSessions}
            </span>{" "}
            sesi
          </p>
        </div>

        {/* Conditional Rendering: Loading, Error, or Data */}
        {isMabarLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MabarCardSkeleton />
            <MabarCardSkeleton />
            <MabarCardSkeleton />
          </div>
        )}

        {mabarError && (
          <div className="text-center py-16 text-red-500">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-2">Gagal Memuat Sesi</h3>
            <p className="text-muted-foreground mb-6">
              Terjadi kesalahan saat mengambil data. Silakan coba lagi.
            </p>
            <Button
              onClick={() => {
                /* re-fetch logic if needed, or simply re-render */
              }}
              className="bg-custom-orange hover:bg-orange-hover"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {!isMabarLoading && !mabarError && mabarSessions.length > 0 && (
          /* Sessions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Perbaikan 4: Gunakan mabarSessions untuk map */}
            {mabarSessions.map((session, index) => {
              // Masalah 1: Deklarasi variabel harus di dalam blok 'map'
              // dan sebelum statement 'return'.
              const slots = session.booking?.booked_slots; // Asumsi: 'slots' harus didefinisikan dari 'session'
              const { startTime, endTime } = getPlayTime(slots); // Asumsi: getPlayTime adalah fungsi yang valid

              // Memastikan semua logika dijalankan sebelum mengembalikan JSX
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-0">
                      {/* Image Container */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            session.cover_image ??
                            "https://placehold.co/400x300/a7f3d0/047857?text=Image"
                          }
                          alt={session.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Sport Badge */}
                        <Badge
                          className={`absolute top-3 left-3 ${
                            // Perbaikan 5: Akses nama olahraga dengan aman
                            // Catatan: Jika session.booking?.field?.sport_category?.icon tidak ada di sportColors,
                            // Anda akan mendapatkan kelas default 'bg-gray-500'. Ini sudah baik.
                            sportColors[
                              session.booking?.field?.sport_category
                                ?.icon as keyof typeof sportColors
                            ] || "bg-gray-500"
                          } text-white border-none`}
                        >
                          {session.booking?.field?.sport_category?.name}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Title */}
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">
                          {session.title}
                        </h3>

                        {/* Host Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="w-8 h-8">
                            {/* Asumsi session.hostAvatar ada */}
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.host?.name}`}
                            />
                            <AvatarFallback>
                              {session?.host?.name?.charAt(0) || "H"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {session?.host?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Host
                            </p>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center text-muted-foreground text-sm mb-3">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {session?.booking?.booking_date} •{" "}
                            {/* Menggunakan startTime dan endTime dari fungsi getPlayTime */}
                            {startTime} - {endTime}
                          </span>
                        </div>

                        {/* Slots Info */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-sm">
                              <Users className="w-4 h-4 mr-1 text-muted-foreground" />
                              <span className="font-medium">
                                {session.participants_count}/
                                {session.slots_total} Slot
                              </span>
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                getSlotStatus(
                                  session.participants_count,
                                  session.slots_total
                                ).color
                              }`}
                            >
                              {
                                getSlotStatus(
                                  session.participants_count,
                                  session.slots_total
                                ).text
                              }
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-custom-orange h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (session.participants_count /
                                    session.slots_total) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-custom-orange">
                              {formatRupiah(session.price_per_slot || 0)}
                            </span>
                            <span className="text-muted-foreground text-sm ml-1">
                              /orang
                            </span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Link href={`/mabar/join/?id=${session.id}`}>
                          <Button
                            className="w-full bg-custom-orange hover:bg-orange-hover"
                            disabled={
                              session.participants_count === session.slots_total
                            }
                          >
                            {session.participants_count === session.slots_total
                              ? "Slot Penuh"
                              : "Gabung Sekarang"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No Results (jika tidak sedang loading, tidak ada error, dan sesi kosong) */}
        {!isMabarLoading && !mabarError && mabarSessions.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">Tidak Ada Hasil</h3>
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

        {/* Pagination Section (Jika diperlukan, belum diimplementasikan di sini) */}
        {/* Anda mungkin ingin menambahkan tombol navigasi halaman (page) di sini */}
      </div>
    </div>
  );
}
