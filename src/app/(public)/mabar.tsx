"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  Loader2,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import useSWR from "swr";
import type { MabarSession, PaginatedResponse } from "@/types";
import { mabarFetcher } from "@/lib/services/mabar.service";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const sportColors = {
  Basketball: "bg-orange-500",
  Futsal: "bg-green-500",
  Badminton: "bg-blue-500",
  Tennis: "bg-yellow-500",
  Volleyball: "bg-purple-500",
};

const formatRupiah = (value: number) => {
  if (isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const getSlotStatus = (filled: number, total: number) => {
  const percentage = (filled / total) * 100;
  if (percentage === 100) return { text: "Penuh", color: "text-red-500" };
  if (percentage >= 80)
    return { text: "Hampir Penuh", color: "text-orange-500" };
  return { text: "Tersedia", color: "text-green-500" };
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

// Skeleton Component for Loading State
function MabarCardSkeleton() {
  return (
    <Card className="overflow-hidden border-gray-200 shadow-lg">
      <CardContent className="p-0">
        <Skeleton className="h-48 w-full" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-orange-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">!</span>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Tidak Ada Hasil
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Belum ada sesi main bareng yang tersedia saat ini. Coba cek lagi nanti
          atau buat sesi baru!
        </p>
      </motion.div>
    </div>
  );
}

export default function MabarCarousel() {
  const swrKey = "/api/mabar-sessions?page=1&per_page=6";

  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<MabarSession>>(swrKey, mabarFetcher, {
    revalidateOnFocus: false,
  });

  const mabarSessions = paginatedData?.data ?? [];

  return (
    <section className="py-10 bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            Main <span className="text-orange-500">Bareng</span> Sekarang
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Gabung komunitas dan main bareng dengan pemain lainnya!
          </p>
        </motion.div>

        {/* Loading State with Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1].map((i) => (
              <MabarCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="w-full flex justify-center items-center py-16">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">⚠️</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Gagal Memuat Data
              </h3>
              <p className="text-red-600 mb-4">
                Terjadi kesalahan saat memuat sesi main bareng.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && mabarSessions.length === 0 && <EmptyState />}

        {/* Data Loaded - Show Carousel */}
        {!isLoading && !error && mabarSessions.length > 0 && (
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4 mb-5">
              {mabarSessions.map((session, index) => {
                const field = session.booking?.field;
                const categoryName = field?.sport_category?.name || "Olahraga";
                const slots = session.booking?.booked_slots;
                const { startTime, endTime } = getPlayTime(slots);
                const date = session.booking?.booking_date;
                const slotStatus = getSlotStatus(
                  session.participants_count,
                  session.slots_total
                );
                const isFull = slotStatus.text === "Penuh";

                return (
                  <CarouselItem
                    key={session.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-0">
                          {/* Image Container */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={
                                session.cover_image ||
                                field?.field_photo ||
                                "https://placehold.co/400x300/cccccc/969696.png?text=mabar&font=lato"
                              }
                              alt={session.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Sport Badge */}
                            <Badge
                              className={`absolute top-3 left-3 ${
                                (sportColors as any)[categoryName] ||
                                "bg-gray-500"
                              } text-white border-none`}
                            >
                              {categoryName}
                            </Badge>
                            {/* Status Badge */}
                            <Badge
                              className={`absolute top-3 right-3 ${
                                isFull
                                  ? "bg-red-500"
                                  : session.participants_count /
                                      session.slots_total >=
                                    0.8
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              } text-white border-none`}
                            >
                              {slotStatus.text}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            {/* Title */}
                            <h3 className="font-bold text-lg mb-3 line-clamp-1 text-gray-900">
                              {session.title}
                            </h3>

                            {/* Host Info */}
                            <div className="flex items-center gap-2 mb-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    session.host?.image ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.host?.name}`
                                  }
                                />
                                <AvatarFallback className="bg-orange-500 text-white text-xs">
                                  {session.host?.name?.charAt(0) || "H"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {session.host?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Host
                                </p>
                              </div>
                            </div>

                            {/* Field Name & Location */}
                            <div className="flex items-start text-muted-foreground text-sm mb-2">
                              <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-orange-500" />
                              <span className="line-clamp-1">
                                {field?.name || "Lokasi TBD"}
                              </span>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center text-muted-foreground text-sm mb-3">
                              <Clock className="w-4 h-4 mr-1 text-orange-500" />
                              <span>
                                {date
                                  ? format(new Date(date), "dd MMM yyyy", {
                                      locale: localeId,
                                    })
                                  : "TBD"}{" "}
                                • {startTime} - {endTime}
                              </span>
                            </div>

                            {/* Slots Info */}
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-3 mb-3 border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-sm">
                                  <Users className="w-4 h-4 mr-1 text-orange-600" />
                                  <span className="font-semibold text-gray-800">
                                    {session.participants_count}/
                                    {session.slots_total} Slot
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-bold ${slotStatus.color}`}
                                >
                                  {slotStatus.text}
                                </span>
                              </div>
                              {/* Progress Bar */}
                              <div className="w-full bg-white rounded-full h-2.5 shadow-inner">
                                <div
                                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
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
                            <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-orange-500" />
                                <span className="text-xs text-gray-600 font-medium">
                                  Biaya per orang
                                </span>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-xl font-bold text-orange-600">
                                  {formatRupiah(session.price_per_slot)}
                                </span>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <Button
                              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500"
                              disabled={isFull}
                              asChild={!isFull}
                            >
                              {isFull ? (
                                <span>Slot Penuh</span>
                              ) : (
                                <Link href={`/mabar/${session.id}`}>
                                  Gabung Sekarang
                                </Link>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Navigation Arrows */}
            <div className="hidden md:block">
              <CarouselPrevious className="left-0 -translate-x-12" />
              <CarouselNext className="right-0 translate-x-12" />
            </div>
          </Carousel>
        )}

        {/* View All Button */}
        {!isLoading && !error && mabarSessions.length > 0 && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              asChild
            >
              <Link href="/mabar">Lihat Semua Sesi Main Bareng</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
