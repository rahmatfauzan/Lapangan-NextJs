"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Field, FieldOperatingHours } from "@/types";
import { toast } from "sonner";
import useSWR from "swr";
// (1) Import service untuk fetch dan update
import {
  hoursFetcher,
  updateFieldHours,
} from "@/lib/services/field.service";

// (2) Definisikan tipe data form secara lokal
type DayHour = {
  day_of_week: number;
  is_open: boolean;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
};

interface FieldHoursFormProps {
  field: Field;
  onSuccess: () => void;
}

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const fullHours = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export function FieldHoursForm({ field, onSuccess }: FieldHoursFormProps) {
  const {
    data,
    error,
    isLoading: isFetching,
  } = useSWR<FieldOperatingHours[]>(
    `/api/admin/fields/${field.id}/operating-hours`,
    hoursFetcher // <-- Gunakan fetcher dari service
  );

  const [hours, setHours] = useState<DayHour[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // (3) Hapus state apiError

  useEffect(() => {
    if (data) {
      const formattedData = data.map((day) => ({
        day_of_week: day.day_of_week,
        is_open: day.is_open,
        start_time: day.start_time.substring(0, 5),
        end_time: day.end_time.substring(0, 5),
      }));
      setHours(formattedData);
    }
  }, [data]);

  const handleHoursChange = (
    index: number,
    field: keyof DayHour,
    value: any
  ) => {
    const newHours = [...hours];
    (newHours[index] as any)[field] = value;
    setHours(newHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // (4) Hapus console.log dan setApiError(null)

    try {
      // (5) Panggil service updateFieldHours
      await updateFieldHours(field.id, hours);

      toast.success("Sukses!", {
        description: "Jam operasional berhasil diperbarui.",
      });
      onSuccess();
    } catch (err: any) {
      // (6) Ganti setError dengan toast.error
      toast.error("Gagal Menyimpan", {
        description:
          err.response?.data?.message || "Gagal menyimpan jam operasional.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching && !data)
    return <div className="text-center py-8">Memuat jam operasional...</div>;
  if (error)
    return (
      <div className="text-destructive text-center py-8">
        Gagal memuat data.
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {/* (7) Hapus {apiError && ...} */}

      <div className="grid grid-cols-3 font-semibold text-sm border-b pb-2 items-center gap-4">
        <div>Hari</div>
        <div className="text-center">Status</div>
        <div className="text-center">Jam Operasional</div>
      </div>

      {hours.map((day, index) => (
        <div
          key={day.day_of_week}
          className="grid grid-cols-3 items-center gap-x-4 gap-y-1"
        >
          <Label className="text-left font-normal">
            {days[day.day_of_week - 1]}
          </Label>

          <div className="flex flex-col items-center">
            <Switch
              checked={day.is_open}
              onCheckedChange={(value) =>
                handleHoursChange(index, "is_open", value)
              }
              disabled={isSubmitting}
            />
            <span className="text-xs text-muted-foreground">
              {day.is_open ? "Buka" : "Tutup"}
            </span>
          </div>

          <div className="grid grid-cols-2 items-center gap-2">
            <Select
              value={day.start_time}
              onValueChange={(value) =>
                handleHoursChange(index, "start_time", value)
              }
              disabled={isSubmitting || !day.is_open}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fullHours.map((hour) => (
                  <SelectItem key={`start-${hour}`} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={day.end_time}
              onValueChange={(value) =>
                handleHoursChange(index, "end_time", value)
              }
              disabled={isSubmitting || !day.is_open}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fullHours.map((hour) => (
                  <SelectItem key={`end-${hour}`} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting} className="mt-4">
        {isSubmitting ? "Menyimpan..." : "Simpan Jam Operasional"}
      </Button>
    </form>
  );
}