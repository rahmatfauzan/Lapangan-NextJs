"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { createMabarSession } from "@/lib/services/mabar.service";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import MabarStep1 from "./step1";
import MabarStep2 from "./step2";
import MabarStep3 from "./step3";
import useSWR from "swr";
import { DetailField } from "@/lib/services/mabar.service";
import { Field } from "@/types";
import MabarConfirmationModal from "./modal";

// --- DEFINISIKAN SKEMA VALIDASI (ZOD) ---
const MAX_FILE_SIZE = 2000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const mabarSchema = z.object({
  // Step 1
  category_id: z.number().min(1, "Kategori wajib dipilih."),
  field_id: z.string().min(1, "Wajib memilih lapangan."),
  booking_date: z.string().min(1, "Tanggal main wajib diisi."),
  booked_slots: z.array(z.string()).min(1, "Wajib memilih minimal 1 jam slot."),

  // Step 2
  title: z.string().min(5, "Judul sesi minimal 5 karakter."),
  type: z.string().min(1, "Tipe sesi wajib dipilih."),
  description: z.string().optional(),
  slots_total: z.number().min(2, "Minimal 2 slot (termasuk Anda)."),
  price_per_slot: z.number().min(0, "Harga tidak boleh negatif."),
  payment_instructions: z.string().min(10, "Instruksi pembayaran wajib diisi."),
  // Step 3
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

export default function CreateMabarPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // --- React Hook Form ---
  const form = useForm<MabarFormValues>({
    resolver: zodResolver(mabarSchema),
    defaultValues: {
      field_id: "",
      booking_date: "",
      booked_slots: [],
      title: "",
      type: "open_play",
      description: "",
      slots_total: 0,
      price_per_slot: 0,
      payment_instructions: "",
      cover_image: undefined,
    },
  });

  const values = form.watch();
  const selectedFieldId = values.field_id;

  // Fetch field data for modal
  const { data: selectedField } = useSWR<Field>(
    selectedFieldId ? `/api/fields/${selectedFieldId}` : null,
    DetailField,
    { revalidateOnFocus: false }
  );

  const steps = [
    {
      number: 1,
      title: "Pilih Lapangan",
      desc: "Pilih lapangan, tanggal & waktu",
    },
    { number: 2, title: "Data Mabar", desc: "Isi detail session mabar" },
    { number: 3, title: "Review", desc: "Periksa & konfirmasi" },
  ];

  // --- Navigasi dengan Validasi ---
  const nextStep = async () => {
    const fieldsToValidate: (keyof MabarFormValues)[] =
      currentStep === 1
        ? ["field_id", "booking_date", "booked_slots"]
        : currentStep === 2
        ? [
            "title",
            "type",
            "slots_total",
            "price_per_slot",
            "payment_instructions",
          ]
        : [];

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setApiError(null);
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setApiError("Terdapat kesalahan input. Mohon periksa kembali data Anda.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setApiError(null);
    }
  };

  // --- Submit Handler ---
  const handleSubmit = async (values: MabarFormValues) => {
    console.log("handleSubmit dipanggil");
    console.log("Form values:", values);
    setIsSubmitting(true);
    setApiError(null);

    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof MabarFormValues];
      if (key === "cover_image" && value) {
        formData.append(key, value);
      } else if (key === "booking_date" && typeof value === "string") {
        formData.append(key, value);
      } else if (key === "booked_slots" && Array.isArray(value)) {
        value.forEach((slot) => formData.append("booked_slots[]", slot));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    try {
      const response = await createMabarSession(formData);


      toast.success("Sesi Mabar Berhasil Dibuat!", {
        description: `Sesi ${values.title} berhasil dibuat. Silakan lakukan pembayaran.`,
      });

      setIsModalOpen(false);

      // Redirect ke halaman pembayaran atau my-sessions
      router.push(`/booking/continue?invoice=${response.booking_to_pay.invoice_number}${`&source=mabar`}`);
      // Atau jika ada halaman payment khusus:
      // router.push(`/mabar/payment/${response.data.id}`);
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Gagal membuat sesi mabar. Coba lagi."
      );
      setIsModalOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to top saat step berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Prepare data for modal
  const modalSessionData = {
    title: values.title || "-",
    fieldName: selectedField?.name || "-",
    date: values.booking_date
      ? format(new Date(values.booking_date), "EEEE, dd MMMM yyyy", {
          locale: localeId,
        })
      : "-",
    timeSlots: values.booked_slots || [],
    totalSlots: values.slots_total || 0,
    pricePerSlot: values.price_per_slot || 0,
    bookingPrice: selectedField
      ? selectedField.price_weekday * (values.booked_slots?.length || 0)
      : 0,
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1">Kembali</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Buat Session <span className="text-orange-500">Main Bareng</span>
          </h1>
          <p className="text-gray-600">
            Ajak orang lain untuk olahraga bareng!
          </p>
        </motion.div>

        {/* Error Display */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800"
          >
            {apiError}
          </motion.div>
        )}

        {/* Form */}
        <Form {...form}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg mb-8"
          >
            {/* Progress Steps */}
            <div className="border-b border-gray-100 px-4 sm:px-6 md:px-8 py-8">
              <div className="flex items-center justify-between relative mx-auto">
                <div className="absolute top-8 left-[8%] right-[8%] sm:left-[10%] sm:right-[10%] h-1 bg-gray-200" />

                <motion.div
                  className="absolute top-8 left-[8%] sm:left-[10%] h-1 bg-orange-500"
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      currentStep === 1
                        ? "0%"
                        : currentStep === 2
                        ? "42%"
                        : "84%",
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex flex-col items-center flex-1 relative z-10"
                  >
                    <motion.div
                      className={`
                        w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mb-3
                        transition-all duration-300 relative
                        ${
                          currentStep > step.number
                            ? "bg-orange-500 text-white shadow-lg"
                            : currentStep === step.number
                            ? "bg-orange-500 text-white ring-4 ring-orange-200 shadow-lg"
                            : "bg-gray-200 text-gray-500"
                        }
                      `}
                      animate={{
                        scale: currentStep === step.number ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ scale: { duration: 0.3, ease: "easeOut" } }}
                    >
                      <AnimatePresence mode="wait">
                        {currentStep > step.number ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Check className="w-6 h-6 sm:w-8 sm:h-8" />
                          </motion.div>
                        ) : (
                          <motion.span
                            key="number"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            {step.number}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <div className="text-center px-1">
                      <p
                        className={`
                        text-xs sm:text-sm font-semibold mb-1 transition-colors
                        ${
                          currentStep >= step.number
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      `}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 md:p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MabarStep1 form={form} />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MabarStep2 form={form} />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MabarStep3 form={form} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </Form>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <motion.button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className={`
              w-full sm:w-auto px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
              ${
                currentStep === 1 || isSubmitting
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
              }
            `}
            whileHover={
              currentStep > 1 && !isSubmitting ? { scale: 1.02, x: -5 } : {}
            }
            whileTap={currentStep > 1 && !isSubmitting ? { scale: 0.98 } : {}}
          >
            <ChevronLeft className="w-5 h-5" />
            Sebelumnya
          </motion.button>

          {currentStep < 3 ? (
            <motion.button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isSubmitting ? { scale: 1.02, x: 5 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              Selanjutnya
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isSubmitting ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting ? { scale: 0.95 } : {}}
            >
              <Check className="w-5 h-5" />
              Buat Mabar
            </motion.button>
          )}
        </motion.div>
      </div>
      {/* Confirmation Modal */}
      <MabarConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        onConfirm={async () => {
          const values = form.getValues();
          await handleSubmit(values);
        }}
        isLoading={isSubmitting}
        sessionData={modalSessionData}
      />
    </div>
  );
}
