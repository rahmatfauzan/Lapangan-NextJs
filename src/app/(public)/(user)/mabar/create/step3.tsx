"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle2,
  Building2,
  Hash,
  Users,
  Banknote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import useSWR from "swr";
import { allFieldsFetcher, DetailField } from "@/lib/services/mabar.service";
import { Field } from "@/types";

interface MabarStep3Props {
  form: UseFormReturn<any>;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const tipe_permainan_labels: Record<string, { label: string; icon: string }> = {
  open_play: { label: "Open Play", icon: "🎯" },
  mini_tournament: { label: "Mini Turnamen", icon: "🏆" },
  team_challenge: { label: "Team Challenge", icon: "😊" },
};

export default function MabarStep3({ form }: MabarStep3Props) {
  const values = form.watch();

  const { data: selectedField, isLoading: isLoadingFields } = useSWR<Field>(
    values.field_id ? `/api/fields/${values.field_id}` : null,
    DetailField,
    { revalidateOnFocus: false }
  );

  const slotsTotal = values.slots_total || 0;
  const pricePerSlot = values.price_per_slot || 0;
  const bookingPrice = selectedField
    ? selectedField.price_weekday * (values.booked_slots?.length || 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Invoice Style Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Review Sesi Mabar</h2>
              <p className="text-orange-100 text-sm">
                Periksa detail sebelum membuat sesi
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-orange-100 mb-1">Session ID</p>
              <p className="text-xl font-bold">
                #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Info - 1 Baris */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900">Informasi Sesi</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Judul Sesi
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {values.title || "-"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Tipe Sesi
                </p>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  {tipe_permainan_labels[values.type]?.icon}
                  {tipe_permainan_labels[values.type]?.label || "-"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Total Slot
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {slotsTotal} peserta
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Harga per Slot
                </p>
                <p className="text-sm font-bold text-orange-600">
                  {formatPrice(pricePerSlot)}
                </p>
              </div>
            </div>
            {values.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Deskripsi
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {values.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Lapangan & Jadwal - Gabung */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900">Lapangan & Jadwal</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Field Details */}
              <div>
                {selectedField ? (
                  <div className="bg-gray-50 rounded-lg p-4 h-full">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          selectedField.field_photo ||
                          "https://placehold.co/400x300/cccccc/969696.png?text=field&font=lato"
                        }
                        alt={selectedField.name}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">
                          {selectedField.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <Building2 className="w-3 h-3" />
                          <span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedField.sport_category.name || "Sport"}
                          </Badge>
                          <Badge
                            variant={
                              selectedField.status ? "default" : "secondary"
                            }
                            className={
                              selectedField.status ? "bg-green-500" : ""
                            }
                          >
                            {selectedField.status ? "Available" : "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Loading field details...
                    </p>
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Tanggal Main
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {values.booking_date
                        ? format(
                            new Date(values.booking_date),
                            "EEEE, dd MMMM yyyy",
                            { locale: localeId }
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      Jam Main ({values.booked_slots?.length || 0} jam)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {values.booked_slots?.map((slot: string) => (
                        <Badge
                          key={slot}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {slot}
                        </Badge>
                      )) || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900">Instruksi Pembayaran</h3>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {values.payment_instructions || "-"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Total Pembayaran (Yang Harus Dibayar Host) */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-5 border-2 border-red-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-red-600" />
              Total Pembayaran Booking
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  Harga Lapangan per Jam
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(selectedField?.price_weekday || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Jumlah Jam Booking</span>
                <span className="font-semibold text-gray-900">
                  {values.booked_slots?.length || 0} jam
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="font-bold text-gray-900 text-base block">
                    Total yang Harus Dibayar
                  </span>
                  <span className="text-xs text-gray-600">
                    (Biaya booking lapangan)
                  </span>
                </div>
                <span className="font-bold text-red-600 text-2xl">
                  {formatPrice(bookingPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Estimasi Revenue Info */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-1">
                  Estimasi Revenue dari Peserta
                </h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>
                    {slotsTotal} peserta × {formatPrice(pricePerSlot)} ={" "}
                    <span className="font-bold">
                      {formatPrice(slotsTotal * pricePerSlot)}
                    </span>
                  </p>
                  <p className="text-xs text-green-700">
                    Ini adalah estimasi total yang akan Anda terima dari peserta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-green-50 border-t-2 border-green-200 p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-green-900 mb-1">
                Siap untuk dipublikasikan!
              </h4>
              <p className="text-sm text-green-800">
                Semua data sudah lengkap. Pastikan Anda siap membayar{" "}
                <span className="font-bold">{formatPrice(bookingPrice)}</span>{" "}
                untuk booking lapangan.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}