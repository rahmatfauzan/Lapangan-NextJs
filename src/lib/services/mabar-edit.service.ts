// lib/services/mabar-edit.service.ts (atau mabar.service.ts)
import api from "@/lib/axios";

export interface EditFormData {
  title: string;
  description: string;
  slots_total: number;
  price_per_slot: number;
  cover_image: string;
  payment_instructions: string;
}

interface AddGuestData {
  guest_name: string;
}

// ==================== GET SESSION ====================
export const getMabarSession = async (sessionId: string) => {
  const response = await api.get(`api/mabar-sessions/${sessionId}`);
  return response.data.data;
};

// ==================== APPROVE PARTICIPANT ====================
export const approveParticipant = async (
  sessionId: string,
  participantId: string
) => {
  try {
    const response = await api.patch(
      `api/mabar-participants/${participantId}/status`,
      { status: "approved" }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal menyetujui peserta"
    );
  }
};

// ==================== REJECT PARTICIPANT ====================
export const rejectParticipant = async (
  sessionId: string,
  participantId: string
) => {
  try {
    const response = await api.patch(
      `api/mabar-participants/${participantId}/status`,
      { status: "rejected" }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal menolak peserta");
  }
};

// ==================== REMOVE PARTICIPANT ====================
export const removeParticipant = async (
  sessionId: string,
  participantId: string
) => {
  try {
    const response = await api.delete(
      `api/mabar-participants/${participantId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal menghapus peserta");
  }
};

// ==================== ADD GUEST PARTICIPANT ====================
export const addGuestParticipant = async (
  sessionId: string,
  data: AddGuestData
) => {
  try {
    const response = await api.post(
      `api/mabar-sessions/${sessionId}/add-manual`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal menambahkan peserta guest"
    );
  }
};

// ==================== UPDATE SESSION ====================
export const updateMabarSession = async (
  sessionId: string,
  formData: FormData
) => {
  try {
    const response = await api.post(
      `api/mabar-sessions/${sessionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal update sesi");
  }
};

// ==================== CANCEL SESSION ====================
export async function cancelMabarSession(sessionId: number) {
  try {
    const response = await api.post(`api/mabar-participants/cancel`, {
      mabar_participant_id: sessionId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal membatalkan sesi mabar"
    );
  }
}