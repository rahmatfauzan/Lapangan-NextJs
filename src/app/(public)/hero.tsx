"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation"; // ✨ TAMBAHKAN
import useSWR from "swr"; // ✨ TAMBAHKAN
import { categoryFetchernoPaginate } from "@/lib/services/category.service"; // ✨ TAMBAHKAN
import { SportCategory } from "@/types"; // ✨ TAMBAHKAN

export default function Hero() {
  const router = useRouter(); // ✨ TAMBAHKAN
  const [selectedSport, setSelectedSport] = useState<string | undefined>(
    undefined
  );

  // ✨ FETCH CATEGORIES DARI API
  const { data: categories } = useSWR<SportCategory[]>(
    "/api/sport-categories",
    categoryFetchernoPaginate,
    { revalidateOnFocus: false }
  );

  // Parallax effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  // ✨ UPDATED SEARCH HANDLER
  const handleSearch = () => {
    if (selectedSport) {
      // Jika ada kategori dipilih, redirect ke /field dengan query parameter
      router.push(`/field?category=${selectedSport}`);
    } else {
      // Jika tidak ada kategori, redirect ke /field tanpa filter
      router.push("/field");
    }
  };

  // ✨ TAMBAHKAN: Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative h-[500px] md:h-[600px] w-full">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ y }}
        >
          <img
            src="/images/basuket.jpg"
            alt="Basketball court"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="relative container mx-auto px-5 h-full flex flex-col justify-center">
        <div className="max-w-2xl pt-50 lg:pt-0">
          {/* Hero Title */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find Your{" "}
            <span className="bg-custom-orange text-white px-3 py-1 rounded-md">
              Court
            </span>
            <br />
            <span className="bg-custom-orange text-white px-3 py-1 rounded-md">
              Book
            </span>{" "}
            Your Game
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            className="text-white/90 text-base md:text-lg mb-8 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Mainkan lapangan dan join komunitas dengan mudah
          </motion.p>
        </div>
      </div>

      <motion.div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-[800px] px-4 flex"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        onKeyPress={handleKeyPress} // ✨ TAMBAHKAN: Support Enter key
      >
        {/* Dropdown Select - ✨ MENGGUNAKAN DATA DARI API */}
        <div className="flex-1">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger
              size="md"
              className="w-full border-none rounded-none rounded-l-md bg-white text-base font-medium shadow-lg focus:ring-0 focus:ring-offset-0 focus:outline-none text-muted-foreground"
            >
              <SelectValue placeholder="Pilih jenis olahraga" />
            </SelectTrigger>
            <SelectContent className="h-full">
              {/* ✨ MAP DATA DARI API */}
              {categories?.map((sport) => (
                <SelectItem key={sport.id} value={sport.id.toString()}>
                  {sport.icon && <span className="mr-2">{sport.icon}</span>}
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="h-14 rounded-none bg-custom-orange hover:bg-orange-hover rounded-r-md cursor-pointer transition-all hover:shadow-lg"
        >
          <Search className="w-5 h-5" />
        </Button>
      </motion.div>
    </section>
  );
}
