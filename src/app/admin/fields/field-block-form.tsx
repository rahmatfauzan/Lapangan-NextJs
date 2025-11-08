// app/admin/fields/field-block-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { toast } from "sonner";
import { createFieldBlock } from "@/lib/services/field.service";
import type { Field } from "@/types";
import { Separator } from "@/components/ui/separator";
import { FieldBlockList } from "./FieldBlockList";
import { useSWRConfig } from "swr";

// Helper (Daftar Jam)
const fullHours = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

// --- SKEMA ZOD (Sudah diperbaiki) ---
const formSchema = z.object({
  reason: z
    .string()
    .min(3, { message: "Alasan wajib diisi (minimal 3 karakter)." }),
  start_date: z.date().min(1, { message: "Tanggal mulai wajib dipilih." }),
  start_time: z.string().min(1, { message: "Jam mulai wajib dipilih." }),
  end_date: z.date().min(1, { message: "Tanggal selesai wajib dipilih." }),
  end_time: z.string().min(1, { message: "Jam selesai wajib dipilih." }),
});
// ------------------------------------

type BlockFormValues = z.infer<typeof formSchema>;

interface FieldBlockFormProps {
  field: Field;
  onSuccess: () => void;
}

export function FieldBlockForm({ field, onSuccess }: FieldBlockFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  const form = useForm<BlockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      start_time: "09:00",
      end_time: "10:00",
    },
  });

  async function onSubmit(values: BlockFormValues) {
    setIsSubmitting(true);

    // --- PERBAIKAN (TYPE GUARD) ---
    // Tambahkan pengecekan ini untuk 'meyakinkan' TypeScript
    if (!values.start_date || !values.end_date) {
      setIsSubmitting(false);
      // Error ini seharusnya sudah ditangani Zod, tapi ini untuk keamanan tipe
      toast.error("Error", {
        description: "Tanggal mulai dan selesai wajib diisi.",
      });
      return;
    }
    // --------------------------------

    // Sekarang TypeScript tahu values.start_date dan values.end_date adalah 'Date'
    const startDateTime = format(
      values.start_date,
      `yyyy-MM-dd ${values.start_time}:00`
    );
    const endDateTime = format(
      values.end_date,
      `yyyy-MM-dd ${values.end_time}:00`
    );

    try {
      await createFieldBlock(field.id, {
        reason: values.reason,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
      });

      toast.success("Sukses!", {
        description: `Jadwal lapangan "${field.name}" berhasil diblokir.`,
      });
      mutate(`/api/admin/fields/${field.id}/blocks`); // Refresh list
      form.reset();
    } catch (error: any) {
      toast.error("Gagal", {
        description:
          error.response?.data?.message || "Gagal menyimpan jadwal blokir.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* --- FORM UNTUK CREATE BLOKIR --- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alasan Blokir</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Maintenance rumput" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- GRUP WAKTU MULAI --- */}
          <div className="space-y-2">
            <FormLabel>Waktu Mulai Blokir</FormLabel>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: id })
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
                          required
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jam" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fullHours.map((h) => (
                          <SelectItem key={`start-${h}`} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* ------------------------- */}

          {/* --- GRUP WAKTU SELESAI --- */}
          <div className="space-y-2">
            <FormLabel>Waktu Selesai Blokir</FormLabel>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: id })
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
                          required
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jam" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fullHours.map((h) => (
                          <SelectItem key={`end-${h}`} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* ------------------------- */}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Menyimpan..." : "Blokir Jadwal"}
          </Button>
        </form>
      </Form>

      <Separator className="my-6" />

      <div>
        <h4 className="font-semibold mb-2">Jadwal Sudah Diblokir</h4>
        <FieldBlockList field={field} />
      </div>
    </div>
  );
}
