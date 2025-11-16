"use client";
import { Search, Calendar, CreditCard, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    id: 1,
    icon: Search,
    title: "Cari Lapangan",
    description: "Pilih jenis olahraga dan lokasi yang kamu inginkan",
    color: "bg-blue-500",
    delay: 0.2,
  },
  {
    id: 2,
    icon: Calendar,
    title: "Pilih Jadwal",
    description: "Tentukan tanggal dan waktu yang sesuai dengan jadwalmu",
    color: "bg-green-500",
    delay: 0.4,
  },
  {
    id: 3,
    icon: CreditCard,
    title: "Bayar Aman",
    description: "Lakukan pembayaran dengan berbagai metode yang tersedia",
    color: "bg-purple-500",
    delay: 0.6,
  },
  {
    id: 4,
    icon: CheckCircle,
    title: "Main!",
    description: "Tunjukkan kode booking dan nikmati permainanmu",
    color: "bg-custom-orange",
    delay: 0.8,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cara <span className="text-custom-orange">Booking</span> Lapangan
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Booking lapangan olahraga jadi lebih mudah dan cepat. Hanya dengan 4
            langkah sederhana!
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          {/* Connection Lines - Desktop Only */}
          <div className="hidden lg:block absolute top-16 left-0 w-full h-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-orange-200"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.delay }}
              >
                {/* Card */}
                <div className="text-center group">
                  {/* Icon Container */}
                  <motion.div
                    className="relative mx-auto mb-6 w-32 h-32 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Animated Circle Background */}
                    <motion.div
                      className={`absolute inset-0 ${step.color} rounded-full opacity-10`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: step.delay + 0.2 }}
                    />

                    {/* Icon Circle */}
                    <motion.div
                      className={`relative z-10 w-20 h-20 ${step.color} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: step.delay + 0.3,
                      }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Step Number Badge */}
                    <motion.div
                      className={`absolute -top-2 -right-2 w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-20`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: step.delay + 0.4,
                      }}
                    >
                      {step.id}
                    </motion.div>
                  </motion.div>

                  {/* Content */}
                  <motion.h3
                    className="text-xl font-bold mb-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: step.delay + 0.5 }}
                  >
                    {step.title}
                  </motion.h3>

                  <motion.p
                    className="text-muted-foreground text-sm leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: step.delay + 0.6 }}
                  >
                    {step.description}
                  </motion.p>
                </div>

                {/* Arrow for Mobile - Between Steps */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="sm:hidden flex justify-center my-4"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: step.delay + 0.7 }}
                  >
                    <div className="text-custom-orange">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <motion.button
              className="px-8 py-4 bg-custom-orange text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mulai Booking Sekarang
            </motion.button>
            <Link href="/fields">
              <motion.button
                className="px-8 py-4 bg-white text-custom-orange font-semibold rounded-lg border-2 border-custom-orange hover:bg-custom-orange hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Lihat Semua Lapangan
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {[
            { value: "< 2 min", label: "Waktu Booking" },
            { value: "24/7", label: "Customer Support" },
            { value: "100%", label: "Aman & Terpercaya" },
            { value: "Instant", label: "Konfirmasi" },
          ].map((fact, index) => (
            <motion.div
              key={index}
              className="text-center p-4 bg-white rounded-lg shadow-md"
              whileHover={{
                y: -5,
                boxShadow:
                  "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-custom-orange mb-1">
                {fact.value}
              </div>
              <div className="text-sm text-muted-foreground">{fact.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
