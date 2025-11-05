"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Moon, Settings, User, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // --- 👇 PANGGIL HOOK useAuth KITA ---
  const { user, isLoading, logout } = useAuth();
  {
    console.log("Navbar isLoading:", isLoading);
  }

  {console.log("Navbar user:", user);}

  useEffect(() => {
    setMounted(true); // Untuk theme toggle
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="p-4 flex items-center justify-end">
      <div className="flex gap-4 items-center">
        {/* Tombol Theme Toggle (Kode Anda sudah benar) */}
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={toggleTheme}
        >
          {!mounted ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : resolvedTheme === "dark" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Dropdown Menu Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="rounded-lg cursor-pointer h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>
                {/* Tampilkan inisial user jika ada */}
                {user ? user.name.substring(0, 2).toUpperCase() : "G"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              {/* Tampilkan nama user jika ada */}
              {isLoading ? "Loading..." : user ? user.name : "Akun Saya"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Hanya tampilkan menu ini jika user sudah login */}
            {user && (
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/admin/profile">
                    <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/admin/settings">
                    <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              // variant="destructive" // (DropdownMenuItem tidak punya prop 'variant')
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={logout} // <-- PANGGIL FUNGSI LOGOUT DARI CONTEXT
            >
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" /> Logout
            </DropdownMenuItem>

            {/* --- 👆 LOGIKA LOGOUT/LOGIN YANG DIPERBAIKI --- */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
