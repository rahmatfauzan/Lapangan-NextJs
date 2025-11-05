// File: app/admin/fields/field-edit-form.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Field } from "@/types";
import { updateField } from "@/lib/services/field.service"; // <-- Import service update

interface FieldEditFormProps {
  field: Field;
  onSuccess: () => void;
}

export function FieldEditForm({ field, onSuccess }: FieldEditFormProps) {
  const [name, setName] = useState(field.name);
  const [description, setDescription] = useState(field.description || "");
  const [priceWeekday, setPriceWeekday] = useState(field.price_weekday);
  const [priceWeekend, setPriceWeekend] = useState(field.price_weekend);
  const [status, setStatus] = useState(field.status === "active");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(field.name);
    setDescription(field.description || "");
    setPriceWeekday(field.price_weekday);
    setPriceWeekend(field.price_weekend);
    setStatus(field.status === "active");
    setError(null);
  }, [field]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price_weekday", priceWeekday.toString());
    formData.append("price_weekend", priceWeekend.toString());
    formData.append("status", status ? "active" : "inactive");
    formData.append("_method", "PUT");

    try {
      await updateField(field.id, formData);

      // --- PANGGIL ONSUCCESS SETELAH API SUKSES ---
      onSuccess();
      // ---------------------------------------------
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengupdate data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nama
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Deskripsi
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price_weekday" className="text-right">
          Hrg. Weekday
        </Label>
        <Input
          id="price_weekday"
          type="number"
          value={priceWeekday}
          onChange={(e) => setPriceWeekday(Number(e.target.value))}
          className="col-span-3"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price_weekend" className="text-right">
          Hrg. Weekend
        </Label>
        <Input
          id="price_weekend"
          type="number"
          value={priceWeekend}
          onChange={(e) => setPriceWeekend(Number(e.target.value))}
          className="col-span-3"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <Switch
            id="status"
            checked={status}
            onCheckedChange={setStatus}
            disabled={isLoading}
          />
          <Badge variant={status ? "default" : "secondary"}>
            {status ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="mt-4">
        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
