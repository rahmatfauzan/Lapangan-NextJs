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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { DashboardStats, Booking, Event } from "@/types";
import {
  getDashboardStats,
  getRecentBookings,
  getUpcomingMabar,
} from "@/lib/services/dashboard.service";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [UpcomingMabar, setUpcomingMabar] = useState<Event[]>([]);
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

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (isPageLoading) {
    return (
      <div className="px-4 md:px-6 space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Memuat Dashboard...
        </h1>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 space-y-6">
      <section>
        <h2 className="text-lg font-medium mb-3">Ringkasan Hari Ini</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Booking Hari Ini
              </CardTitle>
              <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.bookings || 0}</div>
              <p className="text-xs text-muted-foreground">Total pesanan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendapatan Hari Ini
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                {formatRupiah(stats?.revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Dari booking lunas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats?.newUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total pengguna terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mabar Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeMabar || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Sesi menunggu/berjalan
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
                      {booking.invoice}
                    </TableCell>
                    <TableCell>{booking.customer}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {booking.field}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(booking.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/bookings">Lihat Semua Booking</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Event Mendatang</CardTitle>
            <CardDescription>Event resmi yang akan datang.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {UpcomingMabar.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.type} - Mulai: {event.booking_date}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/events/${event.id}`}>Detail</Link>
                </Button>
              </div>
            ))}
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/events">Lihat Semua Event</Link>
              </Button>
            </div>
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
            <Link href="/admin/events/create">
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
