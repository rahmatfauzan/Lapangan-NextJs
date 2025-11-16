"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FieldCarousel from "./lapangan";
import MabarCarousel from "./mabar";
import HowItWorks from "./how-itworks";
import FeaturedCategories from "./categori";
import LocationSection from "./location";
import SponsorSection from "./sponsor";

export default function Content() {
  const [hoveredImage1, setHoveredImage1] = useState<string | null>(null);
  const [hoveredImage2, setHoveredImage2] = useState<string | null>(null);
  return (
    <section className="container mx-auto px-5 py-16 mt-5 xl:mt-14">
      {/* <IntroductionSection /> */}
      <FeaturedCategories />
      <FieldCarousel />
      <MabarCarousel />
      <HowItWorks />
      <SponsorSection />
      <LocationSection />
      {/* Find Partner Section */}
      
    </section>
  );
}
