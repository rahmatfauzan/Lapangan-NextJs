"use client";
import Image from "next/image";
import Navbar from "./navbar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import Hero from "./hero";
import Content from "./content";
import Footer from "./footer";
import ScrollTop from "@/components/ui/scrol-top";

export default function Home() {
  const { setTheme } = useTheme();



  const sports = [
    { value: "basketball", label: "Basketball" },
    { value: "badminton", label: "Badminton" },
    { value: "futsal", label: "Futsal" },
    { value: "tennis", label: "Tennis" },
    { value: "volleyball", label: "Volleyball" },
  ];



  useEffect(() => {
    setTheme("light");
  }, []);

  return (
    <div>
      

      {/* Hero Section */}
      <Hero/>

      {/* Rest of your content */}
      <Content />

      {/* Footer */}
      <Footer/>

      {/* Scroll to Top Button */}
      <ScrollTop/>

    </div>
  );
}
