"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MapPin, Users, Calendar, Trophy, TrendingUp, Star } from "lucide-react";

const stats = [
  {
    id: 1,
    icon: MapPin,
    value: 690,
    suffix: "+",
    label: "Lapangan Terdaftar",
    description: "Di seluruh Indonesia",
    color: "from-orange-400 to-orange-600",
    delay: 0.2,
  },
  {
    id: 2,
    icon: Users,
    value: 15000,
    suffix: "+",
    label: "Pengguna Aktif",
    description: "Setiap bulannya",
    color: "from-blue-400 to-blue-600",
    delay: 0.4,
  },
  {
    id: 3,
    icon: Calendar,
    value: 50000,
    suffix: "+",
    label: "Booking Berhasil",
    description: "Hingga saat ini",
    color: "from-green-400 to-green-600",
    delay: 0.6,
  },
  {
    id: 4,
    icon: Trophy,
    value: 200,
    suffix: "+",
    label: "Event & Tournament",
    description: "Setiap tahunnya",
    color: "from-purple-400 to-purple-600",
    delay: 0.8,
  },
];

const achievements = [
  {
    icon: Star,
    text: "Rating 4.8/5",
    subtext: "dari 10,000+ review",
  },
  {
    icon: TrendingUp,
    text: "98% Kepuasan",
    subtext: "Customer satisfaction",
  },
  {
    icon: Trophy,
    text: "Best Platform 2024",
    subtext: "Sports Booking Award",
  },
];

function Counter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [value, duration, isInView]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl lg:text-6xl font-bold">
      {displayValue.toLocaleString()}
    </div>
  );
}

export default function StatsMetrics() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden ">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-custom-orange/10 rounded-full blur-3xl"
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
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
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

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <div className="bg-custom-orange/20 text-custom-orange px-4 py-2 rounded-full text-sm font-semibold">
              Platform Terpercaya
            </div>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Dipercaya oleh{" "}
            <span className="bg-gradient-to-r from-custom-orange to-yellow-400 bg-clip-text text-transparent">
              Ribuan Atlet
            </span>
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Bergabunglah dengan komunitas olahraga terbesar di Indonesia
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: stat.delay }}
              >
                <motion.div
                  className="relative group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    {/* Icon */}
                    <motion.div
                      className="relative mb-4"
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                      >
                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </motion.div>

                    {/* Counter */}
                    <div className="relative mb-2">
                      <div className="flex items-baseline gap-1">
                        <Counter value={stat.value} duration={2.5} />
                        <span className="text-2xl md:text-3xl font-bold text-custom-orange">
                          {stat.suffix}
                        </span>
                      </div>
                    </div>

                    {/* Label */}
                    <h3 className="text-lg md:text-xl font-bold mb-1">
                      {stat.label}
                    </h3>
                    <p className="text-sm text-gray-400">{stat.description}</p>

                    {/* Decorative Line */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-custom-orange to-yellow-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: stat.delay + 0.5 }}
                    />
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-20 h-20 bg-custom-orange/20 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Achievements Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 group cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-custom-orange to-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-lg md:text-xl font-bold mb-1">
                        {achievement.text}
                      </div>
                      <div className="text-sm text-gray-400">
                        {achievement.subtext}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.button
            className="bg-gradient-to-r from-custom-orange to-yellow-400 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Bergabung Sekarang
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}