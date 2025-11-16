"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Eye,
  X,
  ArrowRight,
  Building2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

import { AnimatePresence, motion } from "framer-motion";
type TabType = "active" | "pending" | "completed" | "failed";

export default function MyBookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const menuRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  useEffect(()=>{
    window.scrollTo(0,0);
  })

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const endpointMap: Record<TabType, string> = {
        active: "api/my-bookings/active",
        pending: "api/my-bookings/pending",
        completed: "api/my-bookings/completed",
        failed: "api/my-bookings/failed",
      };

      const endpoint = endpointMap[activeTab];
      const response = await api.get(endpoint);

      if (response.data.success) {
        setBookings(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error("Gagal memuat data booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinuePayment = (invoiceNumber: string) => {
    router.push(`/booking/continue?invoice=${invoiceNumber}`);
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
        label: "Aktif",
      },
      waiting_payment: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        label: "Menunggu",
      },
      pending: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
        label: "Pending",
      },
      cancelled: {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
        label: "Dibatalkan",
      },
      expired: {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: AlertCircle,
        label: "Expired",
      },
      completed: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: CheckCircle,
        label: "Selesai",
      },
      failed: {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
        label: "Gagal",
      },
    };

    const item = config[status] || config.pending;
    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${item.color} text-xs font-semibold`}
      >
        <Icon className="w-3.5 h-3.5" />
        {item.label}
      </span>
    );
  };

  const getPaymentBadge = (transactionStatus: string) => {
    const config: any = {
      success: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Lunas",
        icon: CheckCircle,
      },
      pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Menunggu",
        icon: Clock,
      },
      failed: {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        label: "Gagal",
        icon: XCircle,
      },
      expired: {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        label: "Expired",
        icon: AlertCircle,
      },
    };

    const item = config[transactionStatus] || {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      label: "-",
      icon: AlertCircle,
    };

    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${item.color} text-xs font-semibold`}
      >
        <Icon className="w-3.5 h-3.5" />
        {item.label}
      </span>
    );
  };

  const tabs = [
    { key: "active", label: "Active", count: 0 },
    { key: "pending", label: "Pending", count: 0 },
    { key: "completed", label: "Completed", count: 0 },
    { key: "failed", label: "Failed", count: 0 },
  ];

  const filteredBookings = bookings.filter((booking: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.invoice_number?.toLowerCase().includes(query) ||
      booking.field?.name?.toLowerCase().includes(query) ||
      booking.field?.venue?.name?.toLowerCase().includes(query)
    );
  });

  const canCancel = (booking: any) => {
    return (
      booking.booked_status === "active" ||
      booking.booked_status === "waiting_payment"
    );
  };

  const isPending = (booking: any) => {
    return (
      booking.booked_status === "waiting_payment" ||
      booking.booked_status === "pending"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-orange-100">
            Kelola semua booking lapangan Anda dengan mudah
          </p>
        </div>
      </div>

      {/* Tabs with Modern Design */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`relative px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "text-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="top"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar with Enhanced Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari invoice, lapangan, atau venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600">Memuat data booking...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Tidak ada booking
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "active" && "Anda belum memiliki booking aktif"}
              {activeTab === "pending" &&
                "Tidak ada booking yang menunggu pembayaran"}
              {activeTab === "completed" && "Belum ada booking yang selesai"}
              {activeTab === "failed" && "Tidak ada booking yang gagal"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
            >
              <Calendar className="w-5 h-5" />
              Booking Sekarang
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Lapangan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Pembayaran
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking: any) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-orange-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-orange-600" />
                          </div>
                          <p className="font-mono text-sm font-bold text-gray-900">
                            {booking.invoice_number}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {booking.field?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {booking.field?.venue?.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-gray-700">
                          <p className="text-sm font-semibold">
                            {new Date(booking.booking_date).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5 max-w-[140px]">
                          {booking.booked_slots
                            ?.slice(0, 2)
                            .map((slot: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 px-2.5 py-1 rounded-lg font-semibold border border-orange-200"
                              >
                                <Clock className="w-3 h-3" />
                                {slot}
                              </span>
                            ))}
                          {booking.booked_slots?.length > 2 && (
                            <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-lg">
                              +{booking.booked_slots.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-orange-600">
                            Rp {booking.price?.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(booking.booked_status)}
                      </td>
                      <td className="px-6 py-5">
                        {getPaymentBadge(booking.transaction?.status)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {/* Detail Button */}
                          <button
                            onClick={() =>
                              router.push(`/booking/${booking.invoice_number}`)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                            Detail
                          </button>

                          {/* Lanjutkan Pembayaran */}
                          {isPending(booking) && !booking.is_expired && (
                            <button
                              onClick={() =>
                                handleContinuePayment(booking.invoice_number)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all"
                              title="Lanjutkan Pembayaran"
                            >
                              Bayar
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="p-4 hover:bg-orange-50/50 transition-colors"
                >
                  {/* Invoice & Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-gray-900">
                          {booking.invoice_number}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(booking.booked_status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field Info */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {booking.field?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {booking.field?.venue?.name}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(booking.booking_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Waktu</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.booked_slots
                          ?.slice(0, 2)
                          .map((slot: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-semibold"
                            >
                              {slot}
                            </span>
                          ))}
                        {booking.booked_slots?.length > 2 && (
                          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-lg">
                            +{booking.booked_slots.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Payment */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Harga</p>
                      <p className="font-bold text-orange-600 text-lg">
                        Rp {booking.price?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Pembayaran</p>
                      {getPaymentBadge(booking.transaction?.status)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/booking/${booking.invoice_number}`)
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>

                    {isPending(booking) && !booking.is_expired && (
                      <button
                        onClick={() =>
                          handleContinuePayment(booking.invoice_number)
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-sm"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Bayar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
