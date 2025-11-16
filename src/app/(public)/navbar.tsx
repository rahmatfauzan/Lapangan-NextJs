"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  Trophy,
  LogOut,
  User,
  X,
  Menu,
  Crown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const location = usePathname();
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRefs = useRef<(HTMLLIElement | null)[]>([]);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const act = (links: string) => {
    if (links === "/") {
      return location === "/";
    }
    return String(location).startsWith(links);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowBottomNav(false);
      } else {
        setShowBottomNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const menu = [
    {
      name: "Home",
      href: "/",
      active: act("/"),
      icon: Home,
    },
    {
      name: "Sewa Lapangan",
      href: "/field",
      active: act("/field"),
      icon: Calendar,
    },
    {
      name: "Main Bareng",
      href: "/mabar",
      active: act("/mabar"),
      icon: Users,
    },
    {
      name: "My Booking",
      href: "/my-booking",
      active: act("/my-booking"),
      icon: Trophy,
    },
    {
      name: "My Mabar",
      href: "/my-mabar",
      active: act("/my-mabar"),
      icon: Crown,
      isSpecial: true, // Mark as special menu
    }
  ];

  // Update indicator position when route changes
  useEffect(() => {
    const activeIndex = menu.findIndex((item) => item.active);
    if (activeIndex !== -1 && menuRefs.current[activeIndex]) {
      const activeElement = menuRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
      }
    }
  }, [location]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="p-5 flex justify-between items-center w-full sticky top-0 bg-white z-50 shadow-xl">
        <div className="flex gap-5 items-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="text-custom-orange">Go</span>Mabar
          </h1>

          {/* Desktop Menu - Hidden on mobile/tablet */}
          <ul className="hidden lg:flex gap-3 relative">
            {menu.map((item, index) => (
              <li
                key={item.name}
                className="flex flex-col"
                ref={(el) => {
                  menuRefs.current[index] = el;
                }}
              >
                <Link
                  href={item.href}
                  className={`${
                    item.active && item.isSpecial
                      ? "text-purple-600 font-medium"
                      : item.active
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary"
                  } transition-colors px-2 py-1`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {/* Animated indicator */}
            <motion.div
              className={`absolute bottom-0 h-1 rounded-full ${
                menu.find((item) => item.active)?.isSpecial
                  ? "bg-gradient-to-r from-purple-500 to-blue-500"
                  : "bg-custom-orange"
              }`}
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          </ul>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden lg:flex items-center gap-3">
          {isLoading ? (
            <div></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        user.image
                          ? user.image
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                      }
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-orange-500 text-white text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil Saya</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm"
                >
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button & Auth - Visible on tablet/mobile */}
        <div className="flex lg:hidden items-center gap-3">
          {isLoading ? (
            <div></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        user.image
                          ? user.image
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                      }
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-orange-500 text-white text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil Saya</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium text-xs px-3"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm text-xs px-3"
                >
                  Daftar
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu - Only for small mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {user && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user?.image || ""} alt={user.name} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <ul className="p-6 space-y-2">
                {menu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          item.active && item.isSpecial
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                            : item.active
                            ? "bg-orange-500 text-white shadow-md"
                            : item.isSpecial
                            ? "text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {user && (
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Keluar</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Only visible on tablet/mobile, hidden on desktop */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40 pb-safe transition-transform duration-300 ${
          showBottomNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <ul className="flex justify-around items-center h-16 px-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${
                    item.active && item.isSpecial
                      ? "text-purple-600"
                      : item.active
                      ? "text-orange-600"
                      : "text-gray-500 hover:text-orange-600"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${item.active ? "scale-110" : ""}`}
                  />
                  <span className="text-[10px] font-medium">{item.name}</span>
                  {item.active && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className={`absolute bottom-0 w-12 h-1 rounded-t-full ${
                        item.isSpecial
                          ? "bg-gradient-to-r from-purple-500 to-blue-500"
                          : "bg-orange-500"
                      }`}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}