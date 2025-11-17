import React from "react";
import { Calendar, MapPin, Clock, DollarSign } from "lucide-react";
import { MabarSession } from "@/types";
import { formatDate, formatPrice } from "@/lib/utils";

interface SessionInfoProps {
  session: MabarSession;
}

export function SessionInfo({ session }: SessionInfoProps) {
  const timeSlots = session.booking?.booked_slots || [];
  const startTime = timeSlots[0] || "-";
  const endTime = timeSlots[timeSlots.length - 1] || "-";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-600" />
        Informasi Sesi
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          icon={MapPin}
          iconBgColor="bg-purple-100"
          iconTextColor="text-purple-600"
          title="Lokasi"
          value={session.booking?.field?.name || "-"}
        />
        <InfoCard
          icon={Calendar}
          iconBgColor="bg-blue-100"
          iconTextColor="text-blue-600"
          title="Tanggal"
          value={
            session.booking?.booking_date
              ? formatDate(session.booking.booking_date)
              : "-"
          }
        />
        <InfoCard
          icon={Clock}
          iconBgColor="bg-orange-100"
          iconTextColor="text-orange-600"
          title="Waktu"
          value={`${startTime} - ${endTime}`}
        />
      </div>

      {/* Payment Instructions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1">
              Cara Pembayaran
            </p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {session.payment_instructions || "Tidak ada instruksi pembayaran"}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">
              <DollarSign className="w-3 h-3" />
              {formatPrice(session.price_per_slot)} / orang
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor: string;
  iconTextColor: string;
  title: string;
  value: string;
  subtitle?: string;
}

function InfoCard({
  icon: Icon,
  iconBgColor,
  iconTextColor,
  title,
  value,
  subtitle,
}: InfoCardProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 ${iconBgColor} rounded-lg shrink-0`}>
        <Icon className={`w-4 h-4 ${iconTextColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{title}</p>
        <p className="font-semibold text-sm text-gray-900 truncate">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-600 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}