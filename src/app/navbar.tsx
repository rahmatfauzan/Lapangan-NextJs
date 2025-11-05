"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-black text-white p-5 flex justify-between items-center">
      <div className="flex gap-5">
        <div>TES AJA!</div>
        <ul className="flex gap-3">
          <Link href="/">
            <li
              className={`cursor-pointer hover:text-gray-300 transition-all ${
                pathname === "/" ? "font-bold text-lg" : "text-base"
              }`}
            >
              Home
            </li>
          </Link>
          <Link href="/about">
            <li
              className={`cursor-pointer hover:text-gray-300 transition-all ${
                pathname === "/about" ? "font-bold text-lg" : "text-base"
              }`}
            >
              About
            </li>
          </Link>
          <Link href="/about/profile">
            <li
              className={`cursor-pointer hover:text-gray-300 transition-all ${
                pathname === "/about/profile"
                  ? "font-bold text-lg"
                  : "text-base"
              }`}
            >
              Profile
            </li>
          </Link>
          <Link href="/product">
            <li
              className={`cursor-pointer hover:text-gray-300 transition-all ${
                pathname === "/product" ? "font-bold text-lg" : "text-base"
              }`}
            >
              Product
            </li>
          </Link>
          <Link href="/lapangan">
            <li
              className={`cursor-pointer hover:text-gray-300 transition-all ${
                pathname === "/lapangan" ? "font-bold text-lg" : "text-base"
              }`}
            >
              Lapangan
            </li>
          </Link>
        </ul>
      </div>
      <Button onClick={() => signIn()}>Login</Button>
    </nav>
  );
}
