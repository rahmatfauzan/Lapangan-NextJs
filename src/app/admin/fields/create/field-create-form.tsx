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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, DollarSign, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createField, updateField } from "@/lib/services/field.service";
import type { Field, SportCategory } from "@/types";
import useSWR from "swr";
import { categoryFetcher } from "@/lib/services/category.service";
import Image from "next/image";

// --- Definisikan Skema Validasi (Zod) ---
const MAX_FILE_SIZE = 2000000; // 2MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Skema form utama
const formSchema = z.object({
  name: z.string().min(3, "Nama lapangan minimal 3 karakter."),
  description: z.string().optional(),
  sport_category_id: z.string().min(1, "Kategori wajib dipilih."),
  price_weekday: z.coerce
    .number()
    .min(10000, "Harga minimal Rp 10.000.") as z.ZodNumber,
  price_weekend: z.coerce
    .number()
    .min(10000, "Harga minimal Rp 10.000.") as z.ZodNumber,
  status: z.boolean(),
  // Validasi File
  field_photo: z
    .any()
    .refine(
      (file) => !file || (file && file.size <= MAX_FILE_SIZE),
      `Ukuran maksimal foto adalah 2MB.`
    )
    .refine(
      (file) => !file || (file && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Hanya format .jpg, .jpeg, .png, .webp yang diizinkan."
    ),
});
// Tipe data form berdasarkan *output* schema Zod
type FieldFormValues = z.infer<typeof formSchema>;

// --- Interface Props ---
interface FieldFormProps {
  initialData?: Field; // <-- Opsional: Data untuk mode Edit
  onSuccess?: () => void; // <-- Opsional: Callback untuk menutup modal
}

// --- Komponen Form (Bisa Create/Edit) ---
export function FieldForm({ initialData, onSuccess }: FieldFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // Tentukan apakah ini mode Edit
  const isEditMode = !!initialData;

  const { data: categories, error: categoriesError } = useSWR<SportCategory[]>(
    "/api/sport-categories",
    categoryFetcher,
    { revalidateOnFocus: false }
  );

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      sport_category_id: initialData?.sport_category.id.toString() || "",
      price_weekday: initialData?.price_weekday || undefined,
      price_weekend: initialData?.price_weekend || undefined,
      status: initialData ? initialData.status === "active" : true,
      field_photo: undefined,
    },
  });
  const existingPhotoUrl = initialData?.field_photo;
  const newPhotoFile = form.watch("field_photo");

  // Reset form jika 'initialData' (di modal) berubah
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        sport_category_id: initialData.sport_category.id.toString(),
        price_weekday: initialData.price_weekday,
        price_weekend: initialData.price_weekend,
        status: initialData.status === "active",
        field_photo: undefined, // Jangan isi ulang file input
      });
    }
  }, [initialData, form]);

  // --- Logika Submit (Pintar) ---
  async function onSubmit(values: FieldFormValues) {
    setIsLoading(true);
    setApiError(null);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("sport_category_id", values.sport_category_id);
    formData.append("price_weekday", values.price_weekday.toString());
    formData.append("price_weekend", values.price_weekend.toString());
    formData.append("status", values.status ? "active" : "inactive");

    if (values.field_photo) {
      formData.append("field_photo", values.field_photo);
    }

    try {
      if (isEditMode) {
        // --- Mode EDIT ---
        formData.append("_method", "PUT");
        await updateField(initialData!.id, formData);
        toast.success("Sukses!", {
          description: `Lapangan "${values.name}" berhasil diperbarui.`,
        });
      } else {
        await createField(formData);
        toast.success("Sukses!", {
          description: `Lapangan "${values.name}" berhasil dibuat.`,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/fields"); // Redirect ke halaman daftar
      }
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Gagal menyimpan data. Coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-5xl mx-auto"
      >
        <Card className="shadow-sm border-muted">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg border-b border-muted pb-2">
              Isi data lapangan secara lengkap dan pastikan harga sudah sesuai.
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {apiError && (
              <p className="text-sm text-destructive text-center bg-destructive/5 rounded-md py-2">
                {apiError}
              </p>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* KOLOM KIRI */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Informasi Dasar
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Nama, jenis olahraga, dan deskripsi lapangan.
                  </p>
                </div>

                {/* 1. Nama Lapangan */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        Nama Lapangan
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Futsal Court A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: ukuran 25x15m, rumput sintetis, lampu malam, kamar ganti."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Jelaskan hal yang relevan untuk penyewa.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 2. Kategori */}
                <FormField
                  control={form.control}
                  name="sport_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis olahraga" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Deskripsi */}
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Harga & Status
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Atur tarif dan ketersediaan lapangan.
                  </p>
                </div>

                {/* 4. Harga Weekday */}
                <FormField
                  control={form.control}
                  name="price_weekday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Harga Weekday (Rp/Jam)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="120000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Senin – Jumat</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5. Harga Weekend */}
                <FormField
                  control={form.control}
                  name="price_weekend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Weekend (Rp/Jam)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="180000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Sabtu – Minggu / Hari Libur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 6. Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 px-4 py-3">
                        <div className="space-y-1">
                          <FormLabel className="!m-0">
                            Aktifkan Lapangan
                          </FormLabel>
                          <FormDescription className="!mt-0">
                            Jika aktif, lapangan bisa dipesan pengguna.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* 7. Foto */}
            <FormField
              control={form.control}
              name="field_photo"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    Foto Lapangan
                  </FormLabel>
                  <div className="w-full h-20 relative rounded-md border border-dashed flex items-center justify-center bg-muted/30">
                    {/* Tampilkan preview file BARU (jika ada) */}
                    {newPhotoFile ? (
                      <Image
                        src={URL.createObjectURL(newPhotoFile)}
                        alt="Preview foto baru"
                        fill
                        className="object-contain rounded-md"
                      />
                    ) : // ATAU, tampilkan foto LAMA (jika ada)
                    existingPhotoUrl ? (
                      <Image
                        src={existingPhotoUrl} // URL dari backend
                        alt={initialData?.name || "Foto lapangan"}
                        fill
                        className="object-contain rounded-md"
                        unoptimized
                      />
                    ) : (
                      // Tampilan default jika tidak ada foto
                      <span className="text-sm text-muted-foreground">
                        Preview Foto
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      className="cursor-pointer"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: {ACCEPTED_IMAGE_TYPES.join(", ")}. Gunakan foto yang
                    jelas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="border-t px-6 py-4 flex justify-end">
            <Button type="submit" disabled={isLoading} className="min-w-40">
              {isLoading
                ? "Menyimpan..."
                : isEditMode
                ? "Simpan Perubahan"
                : "Simpan Lapangan"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
