"use client";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Clock, MapPin, Star } from "lucide-react";

interface BookingHeroProps {
  fieldName?: string;
  fieldLocation?: string;
  rating?: number;
  reviews?: number;
  onBack?: () => void;
}

export default function BookingHero({ fieldName }: { fieldName: string }) {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-custom-orange/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-5 md:py-12">
        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Section - Title & Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {fieldName}
              </h1>

              {/* Description */}
              <p className="text-white/70 text-base leading-relaxed">
                Pilih tanggal dan waktu yang sesuai dengan jadwal Anda. Kami
                menyediakan berbagai slot waktu untuk kenyamanan Anda.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
