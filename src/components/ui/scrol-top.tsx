"use client";
import { useEffect, useState } from "react";

export default function ScrollTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show button only when scrolled more than 300px
      if (currentScrollY > 300) {
        // Scrolling down - hide button
        if (currentScrollY > lastScrollY) {
          setShowScrollTop(false);
        } else {
          // Scrolling up - show button
          setShowScrollTop(true);
        }
      } else {
        setShowScrollTop(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-20 lg:bottom-8 right-8 bg-custom-orange hover:bg-orange-hover text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-40 ${
        showScrollTop
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
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
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
