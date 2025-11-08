import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MabarSession } from "@/types";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

export default function DetailCard({ mabar }: { mabar: MabarSession }) {
  const booking = mabar.booking;
  const getPlayTime = () => {
    if (!booking?.booked_slots || booking.booked_slots.length === 0) {
      return { startTime: null, duration: 0, endTime: null };
    }

    const slots = booking.booked_slots;
    const startTime = slots[0]; // First slot is start time
    const duration = slots.length; // Number of slots = hours

    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + duration;
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    return { startTime, duration, endTime };
  };

  const { startTime, duration, endTime } = getPlayTime();

  return (
    <Card className="border shadow-2xl bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-4xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {mabar.title}
            </CardTitle>
            <div className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Dibuat oleh{" "}
              <span className="font-semibold text-foreground">
                {mabar.host?.name || "Host Tidak Diketahui"}
              </span>
              <DynamicIcon name={mabar.sport_category?.icon as string} className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                {mabar.sport_category?.name || "Kategori Tidak Diketahui"}
              </span>

            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/5 border border-blue-200 dark:border-blue-500/20">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground font-medium">
                Lokasi Lapangan
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-foreground">
                {mabar.booking?.field?.name || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-200 dark:border-purple-500/20">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-500 flex-shrink-0" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground font-medium">
                Jadwal Main
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-foreground">
                {mabar.booking?.booking_date
                  ? format(
                      new Date(mabar.booking.booking_date),
                      "dd MMMM yyyy",
                      { locale: id }
                    )
                  : "Tanggal Tidak Ditemukan"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-500/10 dark:to-orange-600/5 border border-amber-200 dark:border-amber-500/20">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground font-medium">
                Waktu Main
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-foreground">
                {startTime ? (
                  <>
                    {startTime} - {endTime}
                    <span className="text-sm font-normal text-gray-600 dark:text-muted-foreground ml-1">
                      ({duration} jam)
                    </span>
                  </>
                ) : (
                  "Belum Ditentukan"
                )}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-primary to-blue-500" />
            Deskripsi Sesi
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-linear-to-b from-primary/40 to-blue-500/20">
            {mabar.description || "Host tidak memberikan deskripsi tambahan."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
