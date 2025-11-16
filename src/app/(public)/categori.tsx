"use client";
import { categoryFetcher } from "@/lib/services/category.service";
import { PaginatedResponse, SportCategory } from "@/types";
import { hover, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { float32 } from "zod";

const randomColorClasses: { color: string; hoverColor: string }[] = [
  {
    color: "from-orange-400 to-orange-600",
    hoverColor: "group-hover:from-orange-500 group-hover:to-orange-700",
  },
  {
    color: "from-green-400 to-green-600",
    hoverColor: "group-hover:from-green-500 group-hover:to-green-700",
  },
  {
    color: "from-blue-400 to-blue-600",
    hoverColor: "group-hover:from-blue-500 group-hover:to-blue-700",
  },
  {
    color: "from-yellow-400 to-yellow-600",
    hoverColor: "group-hover:from-yellow-500 group-hover:to-yellow-700",
  },
  {
    color: "from-purple-400 to-purple-600",
    hoverColor: "group-hover:from-purple-500 group-hover:to-purple-700",
  },
  {
    color: "from-cyan-400 to-cyan-600",
    hoverColor: "group-hover:from-cyan-500 group-hover:to-cyan-700",
  },
];

function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * randomColorClasses.length);
  return randomColorClasses[randomIndex];
}

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useSWR<
    PaginatedResponse<SportCategory>
  >("api/sport-categories", categoryFetcher);

  return (
    <section className="pt-5 pb-5 bg-white">
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
            Pilih <span className="text-custom-orange">Olahraga</span> Favoritmu
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Berbagai jenis lapangan olahraga tersedia untuk kamu
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories?.data.slice(0, 6).map((category, index) => {
            // Ambil warna acak
            const randomColor = getRandomColor();
            let delay: number = 0.1;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                  delay: index * 0.2,
                }}
              >
                <motion.div
                  className="group relative cursor-pointer"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Card */}
                  <Link href={`/field?category=${category.id}`}>
                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                      {/* Gradient Background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${randomColor.color} ${randomColor.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Content */}
                      <div className="relative p-6 flex flex-col items-center text-center">
                        {/* Icon Container with Animation */}
                        <motion.div
                          className="mb-4 relative"
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* Icon Background Circle */}
                          <div className="absolute inset-0 bg-gray-100 rounded-full blur-xl opacity-50 group-hover:opacity-0 transition-opacity duration-300" />

                          {/* Icon */}
                          <div className="relative text-6xl md:text-7xl transform group-hover:scale-110 transition-transform duration-300">
                            {category.icon}
                          </div>
                        </motion.div>

                        {/* Category Name */}
                        <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-white transition-colors duration-300">
                          {category.name}
                        </h3>

                        {/* Count */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                          <span className="font-semibold">
                            {category.fields_count}
                          </span>
                          <span>lapangan</span>
                        </div>

                        {/* Arrow Icon - Shows on Hover */}
                        <motion.div
                          className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                        >
                          <ArrowRight className="w-5 h-5 text-white" />
                        </motion.div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                    </div>
                  </Link>

                  {/* Floating Badge - Popular */}
                  {category.fields_count > 50 && (
                    <motion.div
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: delay + 0.3,
                        type: "spring",
                        stiffness: 500,
                      }}
                    >
                      Popular
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <p className="text-muted-foreground mb-4">
            Tidak menemukan olahraga yang kamu cari?
          </p>
          <motion.button
            className="text-custom-orange font-semibold hover:underline inline-flex items-center gap-2"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Lihat Semua Kategori
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
