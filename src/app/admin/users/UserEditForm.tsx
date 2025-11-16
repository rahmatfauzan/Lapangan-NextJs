// Ganti nama file menjadi: app/admin/users/user-form.tsx

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
import { updateUser, createUser } from "@/lib/services/user.service"; // <-- Import kedua service
import { useRouter } from "next/navigation";

// Mock Roles (Sebaiknya di-fetch)
const mockRoles = [
  { id: 1, name: "admin" },
  { id: 2, name: "user" },
];

interface UserFormProps {
  initialData?: User; // <-- Jadikan opsional untuk mode CREATE
  onSuccess?: (updatedUserName: string) => void;
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  // Tentukan Mode: Jika initialData ada, maka mode Edit
  const isEditMode = !!initialData;
  const router = useRouter();
  // --- State Form ---
  // Default values disesuaikan untuk mode Create (kosong)
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [password, setPassword] = useState(""); // <-- Tambahan untuk Create
  const [passwordConfirmation, setPasswordConfirmation] = useState(""); // <-- Tambahan untuk Create

  const currentRoleId = initialData?.roles[0]?.id.toString() || "2";
  const [roleId, setRoleId] = useState(currentRoleId);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sinkronisasi state (Hanya saat Edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setRoleId(initialData.roles[0]?.id.toString() || "2");
      setPassword(""); // Kosongkan password saat membuka modal edit
      setPasswordConfirmation("");
      setError(null);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const dataToSend = {
      name,
      email,
      phone,
      address,
      role_id: Number(roleId),
      // Sertakan password hanya jika mode Create atau diisi saat Edit
      ...(isEditMode
        ? {}
        : { password, password_confirmation: passwordConfirmation }),
    };

    try {
      if (isEditMode) {
        // --- MODE EDIT ---
        await updateUser(initialData!.id, dataToSend);
        onSuccess?.(name);
      } else {
        // --- MODE CREATE ---
        // Tambahkan validasi password sederhana di frontend
        if (password.length < 6) {
          setError("Password minimal 6 karakter.");
          setIsLoading(false);
          return;
        }
        if (password !== passwordConfirmation) {
          setError("Konfirmasi password tidak cocok.");
          setIsLoading(false);
          return;
        }

        await createUser(dataToSend);
        toast.success("Sukses!", { description: "Data berhasil disimpan." });
        router.push("/admin/users"); // Redirect ke halaman daftar
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
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
            <SelectTrigger className="w-full">
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

      {/* Input Address */}
      <div className="space-y-1">
        <Label htmlFor="address">Alamat</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* --- INPUT PASSWORD (Hanya untuk CREATE) --- */}
      {!isEditMode && (
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="mt-4">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...
          </>
        ) : isEditMode ? (
          "Simpan Perubahan"
        ) : (
          "Buat Pengguna Baru"
        )}
      </Button>
    </form>
  );
}
