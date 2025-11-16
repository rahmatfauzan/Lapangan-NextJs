"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Users,
  Upload,
  Locate,
  Loader2,
  CheckCircle2,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, formatRupiah } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import useSWR from "swr";
// --- Import Services & Types ---
import {
  createMabarSession,
  allFieldsFetcher,
} from "@/lib/services/mabar.service";
import type { Field } from "@/types";
import { availabilityFetcher } from "@/lib/services/field.service";

// --- DAFTAR HELPER ---
const MAX_FILE_SIZE = 2000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// --- SKEMA VALIDASI (ZOD) ---
const mabarSchema = z.object({
  field_id: z.string().min(1, "Wajib memilih lapangan."),
  booking_date: z
    .date()
    .nullable()
    .refine((val) => val !== null && val !== undefined, {
      message: "Tanggal main wajib diisi.",
    }),
  booked_slots: z.array(z.string()).min(1, "Wajib memilih minimal 1 jam slot."),
  title: z.string().min(5, "Judul sesi minimal 5 karakter."),
  type: z.string().min(1, "Tipe sesi wajib dipilih."),
  description: z.string().optional(),
  slots_total: z.number().min(2, "Minimal 2 slot (termasuk Anda)."),
  price_per_slot: z.number().min(0, "Harga tidak boleh negatif."),
  payment_instructions: z.string().min(10, "Instruksi pembayaran wajib diisi."),
  cover_image: z
    .any()
    .refine(
      (file) => !file || (file && file.size <= MAX_FILE_SIZE),
      `Ukuran maksimal foto adalah 2MB.`
    )
    .refine(
      (file) => !file || (file && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Format tidak valid."
    )
    .optional(),
});

type MabarFormValues = z.infer<typeof mabarSchema>;

interface MabarFormProps {
  onSuccess?: () => void;
}

export default function MabarForm({ onSuccess }: MabarFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // --- Hook Form ---
  // (Deklarasi useForm HARUS di atas agar variabel 'form' tersedia)
  const form = useForm<MabarFormValues>({
    resolver: zodResolver(mabarSchema),
    defaultValues: {
      field_id: "",
      booking_date: null,
      booked_slots: [],
      title: "",
      type: "open_play",
      description: "",
      slots_total: 0,
      price_per_slot: 0,
      payment_instructions:
        "Transfer ke BCA 123456 a.n. Host. Kirim bukti transfer via WhatsApp.",
      cover_image: undefined,
    },
  });

  // --- WATCH VALUES & FETCHERS ---
  const values = form.watch();
  const coverImageFile =
    values.cover_image instanceof File ? values.cover_image : null;

  // Fetch Daftar Lapangan
  const {
    data: fields,
    isLoading: isFieldsLoading,
    error: fieldsError,
  } = useSWR<Field[]>("/api/fields/name", allFieldsFetcher, {
    revalidateOnFocus: false,
  });
  const selectedField = fields?.find(
    (f) => f.id.toString() === values.field_id
  );

  // Fetch Ketersediaan Slot
  const formattedDate = values.booking_date
    ? format(values.booking_date, "yyyy-MM-dd")
    : "";
  const fetchKey =
    values.field_id && formattedDate
      ? { fieldId: values.field_id, date: formattedDate }
      : null;

  const {
    data: availableSlotsData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useSWR(fetchKey, (key) =>
    availabilityFetcher({ fieldId: key.fieldId, date: key.date })
  );
  const availableSlots =
    availableSlotsData?.filter((slot) => slot.is_available) || [];

  // --- Handlers ---
  const handleNextStep = async () => {
    const fieldsToValidate: (keyof MabarFormValues)[] =
      step === 1
        ? ["field_id", "booking_date", "booked_slots"]
        : step === 2
        ? [
            "title",
            "type",
            "slots_total",
            "price_per_slot",
            "payment_instructions",
          ]
        : [];

    const isValid = await form.trigger(fieldsToValidate);

    // Tambahan validasi untuk Step 1: Slot harus benar-benar ada dan tersedia
    if (step === 1 && values.booked_slots.length > 0) {
      const isAllSlotsAvailable = values.booked_slots.every((slot) =>
        availableSlots.some((s) => s.time === slot)
      );
      if (!isAllSlotsAvailable) {
        form.setError("booked_slots", {
          message:
            "Beberapa slot yang dipilih sudah terisi atau tidak tersedia.",
        });
        return;
      }
    }

    if (isValid) {
      setStep(step + 1);
      setApiError(null);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSlotToggle = (slot: string) => {
    const currentSlots = form.getValues("booked_slots");
    const newSlots = currentSlots.includes(slot)
      ? currentSlots.filter((s) => s !== slot)
      : [...currentSlots, slot].sort();
    form.setValue("booked_slots", newSlots, { shouldValidate: true });
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setApiError(null);
  };

  async function onSubmit(values: MabarFormValues) {
    setIsSubmitting(true);
    setApiError(null);

    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof MabarFormValues];
      if (key === "cover_image" && value) {
        formData.append(key, value);
      } else if (key === "booking_date" && value instanceof Date) {
        formData.append(key, format(value, "yyyy-MM-dd"));
      } else if (key === "booked_slots" && Array.isArray(value)) {
        value.forEach((slot) => formData.append("booked_slots[]", slot));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    try {
      await createMabarSession(formData);

      toast.success("Sesi Mabar Berhasil!", {
        description: `Sesi ${values.title} berhasil dibuat. Segera lakukan pembayaran booking.`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/mabar/my-sessions");
      }
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Gagal membuat sesi mabar. Coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- JSX RENDER ---
  return (
    <Card className="max-w-4xl mx-auto shadow-2xl border-2">
      <CardHeader className="p-8 pb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-3xl font-extrabold text-primary">
            Buat Sesi Mabar Baru
          </CardTitle>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  s === step
                    ? "bg-primary w-12"
                    : s < step
                    ? "bg-primary/60"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <CardDescription className="text-base font-medium">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Langkah {step} dari 3 -{" "}
            {step === 1
              ? "Pilih Waktu & Lapangan"
              : step === 2
              ? "Detail Sesi & Harga"
              : "Review & Publikasi"}
          </span>
        </CardDescription>
        {apiError && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive border-2 border-destructive/30 rounded-xl font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{apiError}</span>
          </div>
        )}
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-4 pt-6 space-y-4">
            {/* STEP 1: WAKTU & LAPANGAN */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Pilihan Lapangan */}
                <FormField
                  control={form.control}
                  name="field_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-500/20">
                          <Locate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Pilih Lapangan
                      </FormLabel>
                      
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isFieldsLoading || !!fieldsError}
                      >
                        <FormControl>
                          <SelectTrigger size="sm" className=" border-2 hover:border-primary/50 transition-colors w-full">
                            <SelectValue
                              placeholder={
                                isFieldsLoading
                                  ? "Memuat daftar lapangan..."
                                  : fieldsError
                                  ? "Gagal memuat lapangan"
                                  : "Pilih lapangan yang tersedia..."
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fields?.map((field) => (
                            <SelectItem
                              key={field.id}
                              value={field.id.toString()}
                              className=""
                            >
                              {field.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pilihan Tanggal */}
                <FormField
                  control={form.control}
                  name="booking_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-500/20">
                          <CalendarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        Pilih Tanggal Main
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full h-10 justify-start border-2 hover:border-primary/50 transition-colors"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pilihan Slot Jam */}
                <FormField
                  control={form.control}
                  name="booked_slots"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 space-y-2">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-500/20">
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        Pilih Slot Jam
                        <span className="ml-auto text-sm font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                          {values.booked_slots.length} jam dipilih
                        </span>
                      </FormLabel>

                      {!(values.field_id && values.booking_date) ? (
                        <div className="text-muted-foreground p-4 border-2 border-dashed rounded-xl text-center bg-muted/30">
                          <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">
                            Pilih Lapangan dan Tanggal terlebih dahulu
                          </p>
                        </div>
                      ) : isLoadingSlots ? (
                        <div className="text-center p-4 border-2 rounded-xl bg-primary/5">
                          <Loader2 className="h-8 w-8 animate-spin inline mb-2 text-primary" />
                          <p className="font-medium text-primary">
                            Mencari ketersediaan slot...
                          </p>
                        </div>
                      ) : slotsError ? (
                        <div className="text-destructive p-4 border-2 border-destructive/30 rounded-xl bg-destructive/10">
                          <p className="font-medium">Gagal memuat slot</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-center p-4 text-orange-600 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-500/30 rounded-xl bg-orange-50 dark:bg-orange-500/10">
                          <p className="font-medium">
                            Semua slot sudah terisi atau lapangan tutup
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-36 w-full rounded-xl border-2 p-3 bg-muted/30">
                          <div className="flex flex-wrap gap-2">
                            {availableSlots.map((slot) => (
                              <Badge
                                key={slot.time}
                                onClick={() => handleSlotToggle(slot.time)}
                                className={`cursor-pointer px-3 py-1 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                  values.booked_slots.includes(slot.time)
                                    ? "bg-primary text-primary-foreground shadow-md scale-105 border-2 border-primary"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-transparent"
                                }`}
                              >
                                {slot.time}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 2: DETAIL SESI */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Judul Sesi
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mabar Futsal Seru Malam Jumat"
                          className="h-10 border-2 hover:border-primary/50 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Tipe Sesi
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 border-2 hover:border-primary/50 transition-colors">
                            <SelectValue placeholder="Pilih tipe sesi..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open_play">
                            🎮 Open Play (Acak)
                          </SelectItem>
                          <SelectItem value="team_challenge">
                            ⚔️ Team Challenge
                          </SelectItem>
                          <SelectItem value="mini_tournament">
                            🏆 Mini Tournament
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Slot Total */}
                  <FormField
                    control={form.control}
                    name="slots_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Total Slot Peserta
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            className="h-10 border-2 hover:border-primary/50 transition-colors"
                            {...field}
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Termasuk Anda sebagai Host.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Harga per Slot */}
                  <FormField
                    control={form.control}
                    name="price_per_slot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Harga per Slot (Rp)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25000"
                            className="h-10 border-2 hover:border-primary/50 transition-colors"
                            {...field}
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Biaya yang dibayar per partisipan.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Instruksi Pembayaran */}
                <FormField
                  control={form.control}
                  name="payment_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Instruksi Pembayaran
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Transfer ke BCA 1234..."
                          {...field}
                          className="min-h-[120px] border-2 hover:border-primary/50 transition-colors resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deskripsi Tambahan */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Deskripsi Tambahan (Opsional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informasi tambahan tentang skill atau aturan."
                          {...field}
                          className="min-h-[120px] border-2 hover:border-primary/50 transition-colors resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 3: REVIEW & COVER */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-b-2 pb-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Review dan Cover Sesi</h3>
                </div>

                {/* Review Ringkasan */}
                <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-4 space-y-2 shadow-lg">
                  <p className="font-bold text-xl text-primary border-b pb-2">
                    {values.title}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        Lapangan: {selectedField?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        Tanggal:{" "}
                        {values.booking_date
                          ? format(values.booking_date, "PPP")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        Jam: {values.booked_slots.join(", ")} (
                        {values.booked_slots.length} jam)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        Harga per Slot: {formatRupiah(values.price_per_slot)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Cover Image Upload */}
                <FormField
                  control={form.control}
                  name="cover_image"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-500/20">
                          <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Cover Sesi (Opsional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          className="h-10 border-2 hover:border-primary/50 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer dark:hover:border-input dark:hover:bg-input/50 dark:hover:text-input dark:hover:cursor-pointer"
                          onChange={(event) => {
                            onChange(
                              event.target.files && event.target.files[0]
                            );
                          }}
                        />
                      </FormControl>
                      {coverImageFile && (
                        <div className="mt-2 relative w-40 h-28 border-2 border-primary/30 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={URL.createObjectURL(coverImageFile)}
                            alt="Cover Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <FormDescription className="text-xs">
                        Unggah foto untuk cover sesi (Max 2MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 pt-6 border-t-2 flex justify-between bg-muted/30">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="h-10 px-6 font-semibold border-2 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Sebelumnya
              </Button>
            )}

            {step < 3 && (
              <Button
                type="button"
                onClick={handleNextStep}
                className="ml-auto h-10 px-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                Selanjutnya <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === 3 && (
              <Button
                type="submit"
                className="ml-auto h-10 px-6 font-semibold bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mempublikasikan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Publikasikan Sesi
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
