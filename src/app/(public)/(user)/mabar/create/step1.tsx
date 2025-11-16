"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Dribbble,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { format, addDays, isSameDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";
import { categoryFetchernoPaginate } from "@/lib/services/category.service";
import { Field, PaginatedResponse, SportCategory } from "@/types";
import { availabilityFetcher, Slot } from "@/lib/services/field.service";
import { allFieldsFetcher } from "@/lib/services/mabar.service";

interface MabarStep1Props {
  form: UseFormReturn<any>;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const generateNext14Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    days.push(addDays(today, i));
  }
  return days;
};

export default function MabarStep1({ form }: MabarStep1Props) {
  const [selectedSportId, setSelectedSportId] = React.useState<number | null>(
    form.getValues("category_id")?form.getValues("category_id"): null
  );
  const [showWarning, setShowWarning] = React.useState(false);
  const fieldCardRef = React.useRef<HTMLDivElement>(null);
  const dateTimeCardRef = React.useRef<HTMLDivElement>(null);

  const next14Days = generateNext14Days();

  const values = form.watch();
  const selectedFieldId = values.field_id;
  const selectedDateValue = values.booking_date;
  const selectedDate = selectedDateValue
    ? format(new Date(selectedDateValue), "yyyy-MM-dd")
    : null;
  const selectedTimes = values.booked_slots || [];

  const { data: categoriesSports, isLoading: isLoadingMockCategories } = useSWR<
    SportCategory[]
  >("/api/sport-categories", categoryFetchernoPaginate, {
    revalidateOnFocus: false,
  });

  const { data: availableSlotsData, isLoading: isSlotsLoading } = useSWR<
    Slot[]
  >(
    selectedFieldId && selectedDate
      ? { fieldId: selectedFieldId, date: selectedDate }
      : null,
    (key) => availabilityFetcher(key),
    { revalidateOnFocus: false }
  );

useEffect(() => {
  if (form.getValues("category_id")) {
    console.log("id_category",form.getValues("category_id"),"select",selectedSportId);
  }
}, []);

  const { data: FieldFetch, isLoading: isFieldsLoading } = useSWR<Field[]>(
    selectedSportId ? `/api/fields?sport_category_id=${selectedSportId}` : null,
    allFieldsFetcher,
    { revalidateOnFocus: false }
  );

  const categories = categoriesSports;
  const fields = selectedSportId ? FieldFetch : [];

  const selectedFieldData = fields?.find(
    (f) => f.id === Number(selectedFieldId)
  );

  const handleSportSelect = (sportId: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedSportId(sportId);
    setShowWarning(false);
    form.setValue("field_id", "");
    form.setValue("booking_date", "");
    form.setValue("booked_slots", []);
  };

  const handleFieldSelect = (fieldId: string) => {
    form.setValue("field_id", fieldId);
    form.setValue("booking_date", "");
    form.setValue("booked_slots", []);

    // Smooth scroll ke date & time section
    if (window.innerWidth < 768) {
      // 768px sebagai ukuran untuk medium
      setTimeout(() => {
        dateTimeCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleDateSelect = (date: Date) => {
    setShowWarning(false);
    const dateString = format(date, "yyyy-MM-dd");
    form.setValue("booking_date", dateString, { shouldValidate: true });
    form.setValue("booked_slots", []);
  };

  const handleTimeSelect = (time: string) => {
    const currentSlots = form.getValues("booked_slots") || [];
    const slot = availableSlotsData?.find((s) => s.time === time);
    if (!slot || slot.is_available === false) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    setShowWarning(false);
    const newSlots = currentSlots.includes(time)
      ? currentSlots.filter((t: string) => t !== time)
      : [...currentSlots, time].sort();
    form.setValue("booked_slots", newSlots, { shouldValidate: true });
  };

  const isComplete =
    selectedSportId &&
    selectedFieldId &&
    selectedDate &&
    selectedTimes.length > 0;

  const totalPrice =
    selectedFieldData && selectedTimes.length > 0
      ? selectedFieldData.price_weekday * selectedTimes.length
      : 0;
  console.log("tessss", form.getValues());
  return (
    <div className="space-y-4">
      {/* Sport & Field Selection */}
      <Card className="border-none shadow-none m-0 py-0">
        <CardContent className="p-3">
          <div className="grid md:grid-cols-2 gap-6  ">
            {/* Sport Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        {/* Pastikan Dribbble sudah diimpor */}
                        <Dribbble className="w-4 h-4 text-orange-600" />
                      </div>
                      Jenis Olahraga
                    </FormLabel>

                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          handleSportSelect(Number(value));
                          field.onChange(Number(value));
                        }}
                        value={String(field.value)}
                      >
                        <SelectTrigger
                          size="md"
                          className="w-full border-2 hover:border-orange-300 transition-colors"
                        >
                          {/* SelectValue harus menampilkan nilai saat ini */}
                          <SelectValue placeholder="Pilih olahraga..." />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingMockCategories ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                            </div>
                          ) : (
                            // Pastikan categories adalah array yang tersedia sebelum map
                            categories?.map((sport) => (
                              <SelectItem
                                key={sport.id}
                                value={String(sport.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {sport.icon || "⚽"}
                                  </span>
                                  <span className="font-medium">
                                    {sport.name}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>

                    {/* FormMessage harus ada di dalam FormItem */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Field Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              ref={fieldCardRef}
            >
              <FormField
                control={form.control}
                name="field_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-orange-600" />
                      </div>
                      Lapangan
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={handleFieldSelect}
                        value={field.value}
                        disabled={
                          !selectedSportId ||
                          isFieldsLoading ||
                          !fields ||
                          fields.length === 0
                        }
                      >
                        <SelectTrigger
                          size="md"
                          className="w-full border-2 hover:border-orange-300 transition-colors"
                        >
                          <SelectValue
                            placeholder={
                              !selectedSportId
                                ? "Pilih olahraga dulu"
                                : isFieldsLoading
                                ? "Memuat lapangan..."
                                : fields?.length === 0
                                ? "Tidak ada lapangan"
                                : "Pilih lapangan..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {isFieldsLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                            </div>
                          ) : (
                            fields?.map((fieldItem) => (
                              <SelectItem
                                key={fieldItem.id}
                                value={String(fieldItem.id)}
                                disabled={!fieldItem.status}
                              >
                                <div className="flex items-center gap-3 py-1">
                                  <img
                                    src="https://placehold.co/400x300/cccccc/969696.png?text=field&font=lato"
                                    alt={fieldItem.name}
                                    className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-800">
                                      {fieldItem.name}
                                    </span>
                                    <div className="flex gap-2 text-xs">
                                      <span className="text-orange-600 font-medium">
                                        WD:{" "}
                                        {formatPrice(fieldItem.price_weekday)}
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-orange-600 font-medium">
                                        WE:{" "}
                                        {formatPrice(fieldItem.price_weekend)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Selection */}
      <AnimatePresence mode="wait">
        {selectedFieldId && (
          <motion.div
            ref={dateTimeCardRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="border-none shadow-none m-0 py-0">
              <CardContent className="p-3">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div>
                    <FormField
                      control={form.control}
                      name="booking_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-orange-600" />
                            </div>
                            Pilih Tanggal
                          </FormLabel>
                          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {next14Days.map((date, index) => {
                              const dateString = format(date, "yyyy-MM-dd");
                              const isSelected = selectedDate === dateString;
                              const isToday = isSameDay(date, new Date());

                              return (
                                <motion.button
                                  key={index}
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDateSelect(date)}
                                  className={`relative p-2 rounded-xl border-2 transition-all text-center h-20 flex flex-col items-center justify-center ${
                                    isSelected
                                      ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 text-white shadow-lg"
                                      : "bg-white border-gray-200 hover:border-orange-400 hover:shadow-md"
                                  }`}
                                >
                                  <div
                                    className={`text-[9px] font-semibold uppercase tracking-wide ${
                                      isSelected
                                        ? "text-orange-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {format(date, "EEE", { locale: localeId })}
                                  </div>
                                  <div
                                    className={`text-xl font-bold my-1 ${
                                      isSelected
                                        ? "text-white"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {format(date, "dd")}
                                  </div>
                                  <div
                                    className={`text-[8px] font-bold ${
                                      isSelected
                                        ? "text-orange-100"
                                        : isToday
                                        ? "text-orange-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {isToday
                                      ? "HARI INI"
                                      : format(date, "MMM", {
                                          locale: localeId,
                                        }).toUpperCase()}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <FormField
                      control={form.control}
                      name="booked_slots"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-orange-100 rounded-lg">
                                <Clock className="w-4 h-4 text-orange-600" />
                              </div>
                              Pilih Jam Main
                            </div>
                            {selectedTimes.length > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-xs font-bold">
                                  {selectedTimes.length} jam
                                </span>
                              </motion.div>
                            )}
                          </FormLabel>

                          <AnimatePresence>
                            {showWarning && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2 mb-4"
                              >
                                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-medium">
                                  Slot ini tidak tersedia
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!selectedDate ? (
                            <div className="text-center p-10 border-2 border-dashed rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                              <p className="text-sm font-medium text-gray-600">
                                Pilih tanggal terlebih dahulu
                              </p>
                            </div>
                          ) : isSlotsLoading ? (
                            <div className="text-center p-10 border-2 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
                              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-orange-500" />
                              <p className="text-sm font-medium text-orange-700">
                                Memuat jadwal tersedia...
                              </p>
                            </div>
                          ) : availableSlotsData?.length === 0 ? (
                            <div className="text-center p-10 border-2 rounded-xl bg-gradient-to-br from-red-50 to-red-100">
                              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                              <p className="text-sm font-medium text-red-700">
                                Tidak ada slot tersedia untuk tanggal ini
                              </p>
                            </div>
                          ) : (
                            <>
                              <ScrollArea className="">
                                <div className="grid grid-cols-4 gap-2 p-2">
                                  {availableSlotsData?.map((slot) => {
                                    const isSelected = selectedTimes.includes(
                                      slot.time
                                    );
                                    const isAvailable =
                                      slot.is_available !== false;

                                    return (
                                      <motion.button
                                        key={slot.time}
                                        type="button"
                                        onClick={() =>
                                          handleTimeSelect(slot.time)
                                        }
                                        whileHover={
                                          isAvailable ? { scale: 1.05 } : {}
                                        }
                                        whileTap={
                                          isAvailable ? { scale: 0.95 } : {}
                                        }
                                        disabled={!isAvailable}
                                        className={`relative p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                                          isSelected
                                            ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 text-white shadow-lg"
                                            : !isAvailable
                                            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                            : "bg-white border-gray-200 hover:border-orange-400 hover:shadow-md text-gray-700"
                                        }`}
                                      >
                                        {slot.time}
                                        {!isAvailable && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-xl">
                                            <span className="text-[9px] font-bold text-gray-600 bg-white px-1.5 py-0.5 rounded">
                                              PENUH
                                            </span>
                                          </div>
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </ScrollArea>

                              <div className="flex items-center gap-4 pt-3 border-t">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded border-2 border-orange-600" />
                                  <span className="text-xs font-medium text-gray-600">
                                    Dipilih
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
                                  <span className="text-xs font-medium text-gray-600">
                                    Tersedia
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded" />
                                  <span className="text-xs font-medium text-gray-600">
                                    Penuh
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
