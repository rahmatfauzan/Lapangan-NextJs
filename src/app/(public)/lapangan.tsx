"use client";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import useSWR from "swr";
import type { Field, PaginatedResponse } from "@/types";
import { fieldFetcher } from "@/lib/services/field.service";

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

// Skeleton Component for Loading State
function FieldCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardContent className="p-0">
        <Skeleton className="h-48 w-full" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
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
          Coba ubah filter atau kata kunci pencarian Anda untuk menemukan
          lapangan yang sesuai
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Reset Filter
        </Button>
      </motion.div>
    </div>
  );
}

export default function FieldCarousel() {
  const swrKey = "/api/fields?page=1&per_page=6&sort=popular";

  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR<PaginatedResponse<Field>>(swrKey, fieldFetcher, {
    revalidateOnFocus: false,
  });

  const fields = paginatedData?.data ?? [];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Lapangan <span className="text-orange-500">Terpopuler</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Pilih lapangan favoritmu dan booking sekarang juga!
          </p>
        </motion.div>

        {/* Loading State with Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1].map((i) => (
              <FieldCardSkeleton key={i} />
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
                Terjadi kesalahan saat memuat data lapangan.
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
        {!isLoading && !error && fields.length === 0 && <EmptyState />}

        {/* Data Loaded - Show Carousel */}
        {!isLoading && !error && fields.length > 0 && (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4 mb-5">
              {fields.map((field, index) => (
                <CarouselItem
                  key={field.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-0">
                        {/* Image Container */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={
                              field.field_photo ||
                              "https://placehold.co/400x300/cccccc/969696.png?text=field&font=lato"
                            }
                            alt={field.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Sport Badge */}
                          <Badge
                            className={`absolute top-3 left-3 ${
                              (sportColors as any)[
                                field.sport_category?.name
                              ] || "bg-gray-500"
                            } text-white border-none`}
                          >
                            {field.sport_category?.name || "Sport"}
                          </Badge>
                          {/* Status Badge */}
                          <Badge
                            className={`absolute top-3 right-3 ${
                              field.status ? "bg-green-500" : "bg-red-500"
                            } text-white border-none`}
                          >
                            {field.status ? "Available" : "Tutup"}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          {/* Title */}
                          <h3 className="font-bold text-lg mb-3 line-clamp-1">
                            {field.name}
                          </h3>

                          {/* Price - Weekday & Weekend */}
                          <div className="mb-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  Weekday
                                </span>
                              </div>
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
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                  Weekend
                                </span>
                              </div>
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

                          {/* CTA Button */}
                          <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={!field.status}
                            asChild
                          >
                            <Link href={`/field/${field.id}`}>
                              {field.status
                                ? "Booking Sekarang"
                                : "Tidak Tersedia"}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            <div className="hidden md:block">
              <CarouselPrevious className="left-0 -translate-x-12" />
              <CarouselNext className="right-0 translate-x-12" />
            </div>
          </Carousel>
        )}

        {/* View All Button */}
        {!isLoading && !error && fields.length > 0 && (
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
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
              asChild
            >
              <Link href="/field">Lihat Semua Lapangan</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
