"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BookOpenCheck,
  CalendarClock,
  Users,
  TrendingUp,
  PlusCircle,
  Settings,
  ArrowUpRight,
  Clock,
  Loader2,
  Activity,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { DashboardStats, Booking, UpcomingMabar } from "@/types";
import {
  getDashboardStats,
  getRecentBookings,
  getUpcomingMabar,
} from "@/lib/services/dashboard.service";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [UpcomingMabar, setUpcomingMabar] = useState<UpcomingMabar[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, bookingsData, mabarData] = await Promise.all([
          getDashboardStats(),
          getRecentBookings(),
          getUpcomingMabar(),
        ]);

        setStats(statsData);
        setRecentBookings(bookingsData);
        setUpcomingMabar(mabarData);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  console.log(recentBookings);
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Memuat Dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 space-y-6">
      <section>
        <h1 className="text-3xl font-bold border-b pb-3">Dashboard</h1>
        <h2 className="text-lg font-medium mb-3 mt-6">Ringkasan Hari Ini</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-600/5 border-blue-200 dark:border-blue-500/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 dark:bg-blue-400/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-0">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Booking Hari Ini
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-200 dark:bg-blue-500/20 shadow-sm">
                <BookOpenCheck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stats?.bookings || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Total pesanan masuk
              </p>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-500/10 dark:to-green-600/5 border-green-200 dark:border-green-500/20 z-0">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/30 dark:bg-green-400/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Pendapatan
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-green-200 dark:bg-green-500/20 shadow-sm">
                <TrendingUp className="h-5 w-5 text-green-700 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatRupiah(stats?.revenue || 0)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Dari booking lunas
              </p>
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card className="z-0 relative overflow-hidden border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-600/5 border-purple-200 dark:border-purple-500/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/30 dark:bg-purple-400/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Pengguna Baru
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-200 dark:bg-purple-500/20 shadow-sm">
                <Users className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                +{stats?.newUsers || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Terdaftar hari ini
              </p>
            </CardContent>
          </Card>

          {/* Mabar Card */}
          <Card className="z-0 relative overflow-hidden border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-500/10 dark:to-orange-600/5 border-amber-200 dark:border-amber-500/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 dark:bg-amber-400/10 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Mabar Aktif
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-amber-200 dark:bg-amber-500/20 shadow-sm">
                <Activity className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stats?.activeMabar || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sesi berjalan
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Booking Terbaru</CardTitle>
            <CardDescription>
              Beberapa pesanan terakhir yang masuk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Pemesan</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Lapangan
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.invoice_number}
                    </TableCell>
                    <TableCell>{booking.customer_name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {booking.field.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(booking.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.booked_status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.booked_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/booking">Lihat Semua Booking</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Event Mendatang</CardTitle>
            <CardDescription>Event resmi yang akan datang.</CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {UpcomingMabar.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada event mendatang</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {UpcomingMabar.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2 hover:bg-muted/50 transition-all"
                    >
                      {/* Left Content - 2 Lines */}
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold text-base">{event.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{event.type}</span>
                          <span>•</span>
                          <span>{event.date}</span>
                          <span>•</span>
                          <span>Host: {event.host}</span>
                        </div>
                      </div>

                      {/* Right Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="ml-4"
                      >
                        <Link href={`/admin/mabar/${event.id}`}>Detail</Link>
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/mabar">Lihat Semua Event</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Akses Cepat ⚡</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/fields/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Lapangan
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/mabar/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Buat Event Baru
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" /> Kelola Pengguna
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" /> Pengaturan
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
