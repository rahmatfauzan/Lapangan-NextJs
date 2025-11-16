"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Info } from "lucide-react";
import BookingHero from "./hero";
import BookingConfirmationModal from "./modal-invoice";
import useSWR, { mutate } from "swr";
import { useParams } from "next/navigation";
import { DetailField } from "@/lib/services/mabar.service";
import { Field } from "@/types";
import { availabilityFetcher, Slot } from "@/lib/services/field.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Generate dates for the next 7 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: date.toLocaleDateString("id-ID", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("id-ID", { month: "short" }),
      fullDate: date,
      dateformat: date.toISOString().split("T")[0],
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }
  return dates;
};

const isWeekendDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

export default function BookingPage() {
  const params = useParams();
  const { user } = useAuth();
  const dates = generateDates();
  const [selectedDate, setSelectedDate] = useState(dates[0].dateformat);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  // ✅ FIX: Convert params.id to string
  const fieldId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined;

  const { data: selectedField, isLoading: isLoadingFields } = useSWR<Field>(
    fieldId ? `/api/fields/${fieldId}` : null,
    DetailField,
    { revalidateOnFocus: false }
  );

  // ✅ FIX: Type-safe SWR key
  const slotsKey =
    fieldId && selectedDate
      ? { fieldId: fieldId as string, date: selectedDate }
      : null;

  const { data: timeSlots, isLoading: isSlotsLoading } = useSWR<Slot[]>(
    slotsKey,
    (key) => availabilityFetcher(key),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // ✅ CALLBACK: Refresh slots setelah booking dibuat
  const handleBookingCreated = async () => {
    console.log("🔄 Refreshing time slots...");
    setSelectedSlots([]);

    // Mutate SWR untuk trigger re-fetch
    if (slotsKey) {
      await mutate(
        slotsKey,
        async () => {
          const freshData = await availabilityFetcher(slotsKey);
          console.log("✅ Slots refreshed:", freshData);
          return freshData;
        },
        { revalidate: true }
      );
    }
  };

  const toggleSlot = (time: string) => {
    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter((t) => t !== time));
    } else {
      setSelectedSlots([...selectedSlots, time]);
    }
  };

  const getSlotPrice = (time: string): number => {
    if (!selectedField) return 0;
    const isWeekend = isWeekendDate(selectedDate);
    return isWeekend
      ? selectedField.price_weekend || 0
      : selectedField.price_weekday || 0;
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, time) => {
      return total + getSlotPrice(time);
    }, 0);
  };

  const totalPrice = calculateTotal();

  const getFormattedDate = () => {
    if (!selectedDate) return "";
    const date = new Date(selectedDate);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const userData = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };

  // ✅ Early return jika fieldId tidak valid
  if (!fieldId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Field ID tidak valid</p>
      </div>
    );
  }

  return isLoadingFields || isSlotsLoading ? (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center">
        <div
          role="status"
          aria-label="loading"
          className="animate-spin rounded-full h-10 w-10 border-4 border-t-4 border-custom-orange border-t-transparent"
        />
        <p className="mt-3 text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50">
      <BookingHero fieldName={selectedField?.name as string} />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Section - Date & Time Selection */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Date Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-custom-orange" />
                    <h2 className="text-lg md:text-xl font-bold">
                      Pilih Tanggal
                    </h2>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                    {dates.map((date, index) => {
                      const isSelected = selectedDate === date.dateformat;
                      return (
                        <motion.button
                          key={index}
                          onClick={() => {
                            setSelectedDate(date.dateformat);
                            setSelectedSlots([]);
                          }}
                          className={`relative p-2 md:p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-custom-orange bg-custom-orange text-white"
                              : date.isWeekend
                              ? "border-orange-200 bg-orange-50 hover:border-custom-orange"
                              : "border-gray-200 hover:border-custom-orange"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-[10px] md:text-xs font-medium">
                            {date.day}
                          </div>
                          <div className="text-lg md:text-xl font-bold">
                            {date.date}
                          </div>
                          <div className="text-[10px] md:text-xs">
                            {date.month}
                          </div>
                          {date.isWeekend && !isSelected && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-custom-orange rounded-full" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-custom-orange rounded-full" />
                      <span className="text-muted-foreground">
                        Weekend: Rp{" "}
                        {(selectedField?.price_weekend || 0).toLocaleString()}
                        /slot
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-muted-foreground">
                        Weekday: Rp{" "}
                        {(selectedField?.price_weekday || 0).toLocaleString()}
                        /slot
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Time Slot Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-custom-orange" />
                      <h2 className="text-lg md:text-xl font-bold">
                        Pilih Waktu
                      </h2>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 md:gap-4 mb-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
                      <span>Tersedia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                      <span>Tidak Tersedia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-custom-orange border-2 border-custom-orange rounded" />
                      <span>Dipilih</span>
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  {isSlotsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-orange mx-auto"></div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Memuat waktu tersedia...
                      </p>
                    </div>
                  ) : timeSlots && timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {timeSlots.map((slot, index) => {
                        const isSelected = selectedSlots.includes(slot.time);
                        const isBooked = !slot.is_available;

                        return (
                          <motion.button
                            key={index}
                            onClick={() => !isBooked && toggleSlot(slot.time)}
                            disabled={isBooked}
                            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                              isBooked
                                ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-custom-orange border-custom-orange text-white shadow-md"
                                : "bg-white border-gray-200 hover:border-custom-orange hover:shadow-sm"
                            }`}
                            whileHover={!isBooked ? { scale: 1.05 } : {}}
                            whileTap={!isBooked ? { scale: 0.95 } : {}}
                          >
                            <div className="flex items-center justify-center mb-1">
                              <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            </div>
                            <div className="text-xs md:text-sm font-semibold whitespace-nowrap">
                              {slot.time}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Info className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Tidak ada slot waktu tersedia</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Section - Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="lg:sticky lg:top-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">
                    Ringkasan Booking
                  </h2>

                  {/* Field Name */}
                  <div className="mb-3 md:mb-4">
                    <div className="text-xs md:text-sm text-muted-foreground mb-1">
                      Lapangan
                    </div>
                    <div className="font-semibold text-sm md:text-base">
                      {selectedField?.name}
                    </div>
                  </div>

                  {/* Selected Date */}
                  <div className="mb-4 md:mb-6">
                    <div className="text-xs md:text-sm text-muted-foreground mb-1">
                      Tanggal
                    </div>
                    <div className="font-semibold text-sm md:text-base">
                      {getFormattedDate()}
                    </div>
                    {isWeekendDate(selectedDate) && (
                      <div className="mt-1 inline-block text-[10px] md:text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                        Harga Weekend
                      </div>
                    )}
                  </div>

                  {/* Selected Time Slots */}
                  <div className="mb-4 md:mb-6">
                    <div className="text-xs md:text-sm text-muted-foreground mb-2">
                      Waktu Dipilih
                    </div>
                    {selectedSlots.length === 0 ? (
                      <div className="text-center py-6 md:py-8 text-muted-foreground bg-gray-50 rounded-lg">
                        <Info className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-xs md:text-sm">
                          Pilih waktu untuk melanjutkan
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedSlots.map((time) => {
                          const price = getSlotPrice(time);
                          return (
                            <div
                              key={time}
                              className="flex justify-between items-center text-xs md:text-sm"
                            >
                              <span className="font-medium">{time}</span>
                              <span className="font-semibold text-custom-orange">
                                Rp {price.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  {selectedSlots.length > 0 && (
                    <>
                      <div className="border-t pt-3 md:pt-4 mb-3 md:mb-4 space-y-2">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-muted-foreground">
                            Subtotal ({selectedSlots.length} slot)
                          </span>
                          <span className="font-medium">
                            Rp {totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-muted-foreground">
                            Biaya Platform
                          </span>
                          <span className="text-green-600 font-medium">
                            Gratis
                          </span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t pt-3 md:pt-4 mb-4 md:mb-6">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm md:text-base">
                            Total Bayar
                          </span>
                          <span className="text-xl md:text-2xl font-bold text-custom-orange">
                            Rp {totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Booking Button */}
                  <Button
                    className="w-full bg-custom-orange hover:bg-orange-hover h-11 md:h-12 text-sm md:text-base font-semibold"
                    disabled={selectedSlots.length === 0}
                    onClick={() => setShowModal(true)}
                  >
                    {selectedSlots.length === 0
                      ? "Pilih Waktu"
                      : "Lanjutkan Pembayaran"}
                  </Button>

                  {/* Info */}
                  <div className="mt-3 md:mt-4 flex items-start gap-2 text-[10px] md:text-xs text-muted-foreground bg-blue-50 p-2.5 md:p-3 rounded-lg">
                    <Info className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                    <p>
                      Booking akan dikonfirmasi setelah pembayaran berhasil.
                      Anda akan menerima kode booking via email.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Modal */}
            <BookingConfirmationModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              bookingData={{
                field: selectedField,
                date: selectedDate,
                slots: selectedSlots,
                totalPrice: totalPrice,
              }}
              userData={userData}
              onBookingCreated={handleBookingCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
