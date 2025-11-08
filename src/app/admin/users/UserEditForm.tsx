"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { User } from "@/types";
import { updateUser } from "@/lib/services/user.service"; // <-- Import service update

interface UserEditFormProps {
  initialData: User;
  onSuccess: (updatedUserName: string) => void;
}

// Mock Roles (Sebaiknya di-fetch dari endpoint /api/admin/roles)
const mockRoles = [
  { id: 1, name: "admin" },
  { id: 2, name: "user" },
  { id: 3, name: "host" },
];

export function UserEditForm({ initialData, onSuccess }: UserEditFormProps) {
  // --- State Form ---
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone || "");
  const [address, setAddress] = useState(initialData.address || "");

  // Ambil ID peran saat ini (dari array roles)
  const currentRoleId = initialData.roles[0]?.id.toString() || "2";
  const [roleId, setRoleId] = useState(currentRoleId);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sinkronisasi state saat initialData berubah (saat modal dibuka untuk user lain)
  useEffect(() => {
    setName(initialData.name);
    setEmail(initialData.email);
    setPhone(initialData.phone || "");
    setAddress(initialData.address || "");
    setRoleId(initialData.roles[0]?.id.toString() || "2");
    setError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Data yang akan dikirim ke API
    const dataToSend = {
      name,
      email,
      phone,
      address,
      role_id: Number(roleId), // Kirim ID peran sebagai number
    };

    try {
      // Panggil service updateUser dengan ID dan data yang sudah disiapkan
      await updateUser(initialData.id, dataToSend);

      onSuccess(name); // Panggil callback dengan nama baru untuk toast & refresh
    } catch (err: any) {
      // Tangani error validasi atau API lainnya
      setError(err.response?.data?.message || "Gagal mengupdate pengguna.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {/* Input Nama */}
      <div className="space-y-1">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Input Email */}
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Input Phone */}
        <div className="space-y-1">
          <Label htmlFor="phone">Nomor HP</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Select Role */}
        <div className="space-y-1">
          <Label>Peran Pengguna</Label>
          <Select value={roleId} onValueChange={setRoleId} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Peran" />
            </SelectTrigger>
            <SelectContent>
              {mockRoles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input Address (Gunakan Textarea jika diperlukan) */}
      <div className="space-y-1">
        <Label htmlFor="address">Alamat</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="mt-4">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...
          </>
        ) : (
          "Simpan Perubahan"
        )}
      </Button>
    </form>
  );
}
