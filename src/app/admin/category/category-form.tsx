"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Activity, icons } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/lib/services/category.service"; 
import type { SportCategory } from "@/types";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

// --- Skema Validasi (Zod) ---
const formSchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter."),
  icon: z.string().min(1, "Ikon wajib dipilih."), 
});

type CategoryFormValues = z.infer<typeof formSchema>;

// --- Interface Props ---
interface CategoryFormProps {
  initialData?: SportCategory; 
  onSuccess?: () => void; 
}

// --- Daftar Ikon (Contoh) ---
const iconList = Object.keys(icons).filter(
  (key) => !["createReactComponent", "icons"].includes(key)
).slice(0, 50); 

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const isEditMode = !!initialData;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      icon: initialData?.icon || "Activity", 
    },
  });

  // Reset form jika 'initialData' (di modal) berubah
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        icon: initialData.icon || "Activity",
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: CategoryFormValues) {
    setIsLoading(true);
    setApiError(null);

    try {
      if (isEditMode) {
        await updateCategory(initialData!.id, values);
        toast.success("Sukses!", { description: `Kategori "${values.name}" berhasil diperbarui.` });
      } else {
        await createCategory(values);
        toast.success("Sukses!", { description: `Kategori "${values.name}" berhasil dibuat.` });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/sport-categories"); 
      }

    } catch (error: any) {
      setApiError(error.response?.data?.message || "Gagal menyimpan data. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }
  
  const selectedIcon = form.watch("icon");

  return (
    <Form {...form}>
      <Card className="shadow-lg border border-muted rounded-md ">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="border-b">
            <CardTitle>{isEditMode ? "Edit Kategori" : "Tambah Kategori"}</CardTitle>
            <CardDescription className="">
              {isEditMode ? "Perbarui detail kategori." : "Buat kategori olahraga baru."}
            </CardDescription>
          </CardHeader>

          {/* Hapus 'space-y-6' dari sini */}
          <CardContent className="mt-4">
            {apiError && (
              <p className="text-sm text-destructive text-center mb-4">{apiError}</p>
            )}

            {/* --- 1. BUAT GRID UNTUK 1 BARIS --- */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* --- Kolom 1: Nama Kategori --- */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      Nama Kategori
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Futsal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Kolom 2: Ikon (Dropdown/Select) --- */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Ikon</FormLabel>
                    <div className="flex items-center gap-2">
                      {/* Preview Ikon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-md border bg-muted">
                        <DynamicIcon name={selectedIcon} className="h-5 w-5" />
                      </div>
                      {/* Pilihan Ikon */}
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          {/* Tambahkan w-full agar lebarnya sama */}
                          <SelectTrigger className="w-full"> 
                            <SelectValue placeholder="Pilih ikon..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {iconList.map((iconName) => (
                            <SelectItem key={iconName} value={iconName}>
                              <div className="flex items-center gap-2">
                                <DynamicIcon name={iconName} className="h-4 w-4" />
                                <span>{iconName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* --- Akhir Grid --- */}

          </CardContent>

          <CardFooter className=" px-6 py-4 flex justify-end">
            <Button type="submit" disabled={isLoading} className="min-w-40">
              {isLoading ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan Kategori")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Form>
  );
}