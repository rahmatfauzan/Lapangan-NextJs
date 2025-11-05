import api from '@/lib/axios'; // (Instance Axios kamu)
import type { User } from '@/types'; // (Asumsi kamu punya Tipe User)

// Tipe untuk data Paginasi (sesuai respons Laravel)
interface PaginatedUsers {
  data: User[];
  links: { [key: string]: string | null };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * [ADMIN] Mengambil daftar semua pengguna (dengan paginasi)
 */
export async function getAllUsers(page: number = 1): Promise<PaginatedUsers> {
  try {
    // Panggil endpoint Admin
    const response = await api.get(`/api/admin/users?page=${page}`);
    return response.data; // (Laravel Paginate otomatis bungkus di 'data')
  } catch (error: any) {
    console.error("Gagal mengambil daftar pengguna:", error);
    throw new Error("Gagal mengambil data pengguna.");
  }
}

/**
 * [ADMIN] Membuat pengguna baru
 * (data bisa berupa FormData jika ada gambar, atau JSON)
 */
export async function createUser(data: any): Promise<User> {
  try {
    const response = await api.post('/api/admin/users', data, {
      // (Tambahkan header 'Content-Type': 'multipart/form-data' jika kirim gambar)
    });
    return response.data.data; // (Asumsi dibungkus UserResource)
  } catch (error: any) {
    console.error("Gagal membuat pengguna:", error);
    throw error; // Lempar error agar form bisa menangani (misal: error validasi)
  }
}

/**
 * [ADMIN] Update pengguna
 */
export async function updateUser(userId: number, data: any): Promise<User> {
    try {
        // Ingat 'Method Spoofing' jika kirim gambar
        // data.append('_method', 'PUT'); 
        // const response = await api.post(`/api/admin/users/${userId}`, data, { ... });
        
        // Jika tidak ada gambar, PUT biasa:
        const response = await api.put(`/api/admin/users/${userId}`, data);
        return response.data.data;
    } catch (error: any) {
        console.error("Gagal update pengguna:", error);
        throw error;
    }
}

/**
 * [ADMIN] Hapus pengguna
 */
export async function deleteUser(userId: number): Promise<void> {
    try {
        await api.delete(`/api/admin/users/${userId}`);
    } catch (error: any) {
        console.error("Gagal menghapus pengguna:", error);
        throw new Error("Gagal menghapus pengguna.");
    }
}