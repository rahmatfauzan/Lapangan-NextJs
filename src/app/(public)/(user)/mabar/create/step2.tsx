"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  DollarSign,
  CreditCard,
  MessageSquare,
  Info,
  Upload,
  X,
  Image,
} from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";

interface MabarStep2Props {
  form: UseFormReturn<any>;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const tipe_permainan = [
  {
    value: "open_play",
    label: "Open Play",
    description: "Fun & Terbuka untuk umum",
    icon: "🎯",
  },
  {
    value: "mini_tournament",
    label: "Mini Turnamen",
    description: "Permainan kompetitif",
    icon: "🏆",
  },
  {
    value: "team_challenge",
    label: "Team Challenge",
    description: "Permainan antar tim",
    icon: "😊",
  },
];

export default function MabarStep2({ form }: MabarStep2Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const values = form.watch();
  const slotsTotal = values.slots_total || 0;
  const pricePerSlot = values.price_per_slot || 0;
  const totalRevenue = slotsTotal * pricePerSlot;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("cover_image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    form.setValue("cover_image", undefined);
    setPreviewUrl(null);
  };

  useEffect(() => {
    const file = form.getValues("cover_image");
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [form]);

  return (
    <div className="space-y-6">
      {/* Session Type & Title */}
      <Card className="border-none shadow-none m-0 py-0">
        <CardContent className="p-3">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                      Judul Sesi Mabar
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Main Futsal Sore Santai"
                        {...field}
                        className="border-2 hover:border-orange-300 transition-colors"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Buat judul yang menarik dan deskriptif (min. 5 karakter)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Users className="w-4 h-4 text-orange-600" />
                      </div>
                      Tipe Sesi
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          size="9"
                          className="border-2 w-full hover:border-orange-300 transition-colors"
                        >
                          <SelectValue placeholder="Pilih tipe sesi" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipe_permainan.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              <div className="flex items-center gap-1">
                                <span className="text-xl">{item.icon}</span>
                                <div>
                                  <div className="font-semibold">
                                    {item.label}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Pilih tipe sesi sesuai kebutuhan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Total Slots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="slots_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Users className="w-4 h-4 text-orange-600" />
                      </div>
                      Total Slot Peserta
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2}
                        placeholder="e.g. 10"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        value={field.value === 0 ? "" : field.value}
                        className="border-2 hover:border-orange-300 transition-colors"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Jumlah total peserta (termasuk Anda, min. 2)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Price per Slot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <FormField
                control={form.control}
                name="price_per_slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                      </div>
                      Harga per Slot
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          Rp
                        </span>
                        <Input
                          type="text"
                          value={
                            field.value === 0
                              ? ""
                              : field.value.toLocaleString("id-ID")
                          }
                          placeholder="0"
                          onChange={(e) => {
                            let value = e.target.value.replace(/\./g, "");
                            if (!value) value = "0";
                            field.onChange(parseInt(value) || 0);
                          }}
                          className="border-2 hover:border-orange-300 transition-colors pl-12"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Biaya yang harus dibayar per peserta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Description & Payment */}
      <Card className="border-none shadow-none m-0 py-0 grid md:grid-cols-2">
        <CardContent className="p-3 pe-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                    </div>
                    Deskripsi (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsikan sesi mabar Anda, aturan main, level pemain yang diharapkan, dll."
                      className="border-2 hover:border-orange-300 transition-colors min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Tambahkan detail untuk menarik lebih banyak peserta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </CardContent>
        <CardContent className="py-3 ps-0 pe-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <FormField
              control={form.control}
              name="payment_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                    Instruksi Pembayaran
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Transfer ke BCA 1234567890 a.n. John Doe. Kirim bukti transfer ke WA: 08123456789"
                      className="border-2 hover:border-orange-300 transition-colors min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Jelaskan cara pembayaran yang harus dilakukan peserta (min.
                    10 karakter)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </CardContent>
      </Card>

      {/* Upload Cover Image */}
      <Card className="border-none shadow-none m-0 py-0">
        <CardContent className="p-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <FormField
              control={form.control}
              name="cover_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Image className="w-4 h-4 text-orange-600" />
                    </div>
                    Cover Image (Opsional)
                  </FormLabel>
                  <FormControl>
                    <div>
                      {!previewUrl ? (
                        <label className="block cursor-pointer">
                          <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-gradient-to-br from-orange-50/50 to-white hover:border-orange-400 transition-all hover:bg-orange-50/80">
                            <Upload className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Klik untuk upload cover image
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WEBP (Max. 2MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border-2 border-orange-200">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <motion.button
                            type="button"
                            onClick={removeImage}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Upload cover untuk membuat sesi lebih menarik
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <Card className="border-none shadow-none m-0 py-0">
        <CardContent className="p-3">
          {slotsTotal > 0 && pricePerSlot > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Info className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-700 font-medium">
                      Total Potensi Revenue
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {slotsTotal} peserta × {formatPrice(pricePerSlot)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-base font-bold">
                    {formatPrice(totalRevenue)}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Buat judul yang jelas dan menarik</li>
              <li>• Tentukan harga yang fair untuk semua peserta</li>
              <li>• Berikan instruksi pembayaran yang detail dan mudah</li>
              <li>• Upload cover image yang menarik untuk promosi</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}