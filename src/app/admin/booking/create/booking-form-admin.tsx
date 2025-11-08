// app/admin/bookings/create/booking-form-admin.tsx

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  CalendarIcon,
  Locate,
  Clock,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  CreditCard,
  AlertCircle,
  Calendar as CalendarCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import useSWR from "swr";
import { allFieldsFetcher } from "@/lib/services/mabar.service";
import type { Field } from "@/types";
import { cn } from "@/lib/utils";
import { availabilityFetcher } from "@/lib/services/field.service";
import { createAdminBooking } from "@/lib/services/booking.service";

// --- SKEMA VALIDASI (ZOD) ---
const adminBookingSchema = z.object({
  field_id: z.string().min(1, "Wajib memilih lapangan."),
  booking_date: z
    .date()
    .nullable()
    .refine((val) => val !== null && val !== undefined, {
      message: "Tanggal main wajib diisi.",
    }),
  booked_slots: z.array(z.string()).min(1, "Wajib memilih minimal 1 jam slot."),
  name_orders: z.string().min(3, "Nama pemesan wajib diisi."),
  phone_orders: z.string().min(10, "Nomor HP tidak valid."),
  payment_gateway: z.string().min(1, "Metode pembayaran wajib dipilih."),
});

type AdminBookingValues = z.infer<typeof adminBookingSchema>;

export default function BookingFormAdmin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // --- Data Fetching ---
  const {
    data: fields,
    isLoading: isFieldsLoading,
    error: fieldsError,
  } = useSWR<Field[]>("/api/fields/name", allFieldsFetcher, {
    revalidateOnFocus: false,
  });

  const form = useForm<AdminBookingValues>({
    resolver: zodResolver(adminBookingSchema),
    defaultValues: {
      field_id: "",
      booking_date: null,
      booked_slots: [],
      name_orders: "",
      phone_orders: "",
      payment_gateway: "cash",
    },
  });

  const values = form.watch();
  const selectedField = fields?.find(
    (f) => f.id.toString() === values.field_id
  );
  const formattedDate = values.booking_date
    ? format(values.booking_date, "yyyy-MM-dd")
    : "";

  // Fetch Ketersediaan Slot
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
    availableSlotsData?.filter((slot: any) => slot.is_available) || [];

  // --- Handlers ---
  const handleSlotToggle = (slot: string) => {
    const currentSlots = form.getValues("booked_slots");
    const newSlots = currentSlots.includes(slot)
      ? currentSlots.filter((s) => s !== slot)
      : [...currentSlots, slot].sort();
    form.setValue("booked_slots", newSlots, { shouldValidate: true });
  };

  async function onSubmit(values: AdminBookingValues) {
    setIsSubmitting(true);
    setApiError(null);

    const bookingData = {
      ...values,
      booking_date: format(values.booking_date!, "yyyy-MM-dd"),
      payment_gateway: values.payment_gateway,
    };

    try {
      const result = await createAdminBooking(bookingData as any);

      toast.success("Booking Sukses!", {
        description: `Booking untuk ${
          result.customer_name || result.user.name
        } telah dibuat.`,
      });

      router.push(`/admin/booking`);
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Gagal membuat booking. Coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- JSX RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <Card className="max-w-4xl mx-auto shadow-2xl border-none bg-card/95 backdrop-blur-sm">
        <CardHeader className="p-6 pb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Buat Booking Admin
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Buat pemesanan lapangan cepat untuk tamu atau pengguna
              </CardDescription>
            </div>
          </div>

          {apiError && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-destructive/10 text-destructive border-2 border-destructive/30 rounded-xl">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p className="text-sm mt-1">{apiError}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-6 space-y-8">
              {/* SECTION 1: Lokasi & Waktu */}

              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <Locate className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Lokasi & Jadwal</h3>
                    <p className="text-sm text-muted-foreground">
                      Pilih lapangan dan waktu booking
                    </p>
                  </div>
                </div>

                <div className="space-y-6 grid grid-cols-2 gap-4">
                  {/* Pilihan Lapangan */}
                  <FormField
                    control={form.control}
                    name="field_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          Pilih Lapangan
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isFieldsLoading || !!fieldsError}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 w-full">
                              <SelectValue placeholder="Pilih lapangan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isFieldsLoading ? (
                              <SelectItem value="loading" disabled>
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                Memuat...
                              </SelectItem>
                            ) : (
                              fields?.map((field) => (
                                <SelectItem
                                  className=""
                                  key={field.id}
                                  value={field.id.toString()}
                                >
                                  <div className="flex items-center gap-2">
                                    <Locate className="h-4 w-4 text-blue-500" />
                                    {field.name}
                                  </div>
                                </SelectItem>
                              ))
                            )}
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
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500" />
                          Pilih Tanggal Main
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 justify-start font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
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
                </div>

                {/* Pilihan Slot Jam */}
                <FormField
                  control={form.control}
                  name="booked_slots"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        Pilih Slot Jam
                        <Badge variant="secondary" className="ml-2">
                          {values.booked_slots.length} jam dipilih
                        </Badge>
                      </FormLabel>

                      {!(values.field_id && values.booking_date) ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-xl bg-muted/30">
                          <Clock className="h-12 w-12 mb-3 opacity-50" />
                          <p className="font-medium">
                            Pilih Lapangan dan Tanggal Terlebih Dahulu
                          </p>
                          <p className="text-sm mt-1 text-center">
                            Slot jam akan muncul setelah Anda memilih lapangan
                            dan tanggal
                          </p>
                        </div>
                      ) : isLoadingSlots ? (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl">
                          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                          <p className="font-medium">
                            Mencari ketersediaan slot...
                          </p>
                        </div>
                      ) : slotsError ? (
                        <div className="flex items-start gap-3 p-4 text-destructive border-2 border-destructive/30 rounded-xl bg-destructive/5">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <p className="font-medium">
                            Gagal memuat slot. Silakan coba lagi.
                          </p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-orange-600 p-8 border-2 border-orange-500/30 rounded-xl bg-orange-500/10">
                          <AlertCircle className="h-12 w-12 mb-3" />
                          <p className="font-semibold">
                            Tidak Ada Slot Tersedia
                          </p>
                          <p className="text-sm mt-1">
                            Semua slot sudah terisi atau lapangan tutup pada
                            tanggal ini
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                          <ScrollArea className="h-44 w-full pr-4">
                            <div className="flex flex-wrap gap-2">
                              {availableSlots.map((slot: any) => (
                                <Badge
                                  key={slot.time}
                                  onClick={() => handleSlotToggle(slot.time)}
                                  className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all hover:scale-105 ${
                                    values.booked_slots.includes(slot.time)
                                      ? "bg-primary text-primary-foreground shadow-md scale-105 ring-2 ring-primary/50"
                                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                                  }`}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {slot.time}
                                </Badge>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                      <FormDescription className="text-xs">
                        💡 Klik pada jam untuk memilih/membatalkan slot waktu
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION 2: Detail Pemesan & Pembayaran */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-2">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      Detail Pemesan & Pembayaran
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Informasi kontak dan metode pembayaran
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <FormField
                    control={form.control}
                    name="name_orders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Nama Lengkap
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Masukkan nama lengkap pemesan"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs mt-1.5">
                          Nama lengkap pemesan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Nomor Handphone */}
                  <FormField
                    control={form.control}
                    name="phone_orders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Nomor Handphone
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="081234567890"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs mt-1.5">
                          Nomor yang dapat dihubungi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Metode Pembayaran */}
                <FormField
                  control={form.control}
                  name="payment_gateway"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Metode Pembayaran
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih metode pembayaran..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              Pembayaran Tunai (Lunas/Admin)
                            </div>
                          </SelectItem>
                          <SelectItem value="transfer">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                              Transfer Bank (Pending Bayar)
                            </div>
                          </SelectItem>
                          <SelectItem value="midtrans">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500" />
                              Kartu Kredit/Midtrans (Integrasi)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs mt-1.5">
                        Pilih metode pembayaran yang sesuai
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-4 border-t bg-muted/30 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Pastikan semua data sudah benar sebelum membuat booking
              </p>
              <Button
                type="submit"
                className="h-11 px-6 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Buat Booking
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
