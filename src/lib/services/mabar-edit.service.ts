import api from "@/lib/axios";

// ==================== TIPE DATA ====================
interface UpdateSessionData {
  title?: string;
  description?: string;
  slots_total?: number;
  price_per_slot?: number;
  payment_instructions?: string;
}

interface AddGuestData {
  name: string;
  phone: string;
  email?: string;
}

// ==================== GET SESSION (sudah ada) ====================
export const getMabarSession = async (sessionId: string) => {
  const response = await api.get(`api/mabar-sessions/${sessionId}`);
  return response.data;
};

// ==================== UPDATE SESSION ====================
/**
 * Update informasi sesi mabar (hanya untuk host)
 * Endpoint: PATCH /api/mabar/:sessionId
 */
export const updateMabarSession = async (
  sessionId: string,
  data: UpdateSessionData
) => {
  try {
    const response = await api.patch(`/mabar/${sessionId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal update sesi");
  }
};

// ==================== APPROVE PARTICIPANT ====================
/**
 * Menyetujui peserta yang pending/awaiting_approval
 * Endpoint: POST /api/mabar/:sessionId/participants/:participantId/approve
 */
export const approveParticipant = async (
  sessionId: string,
  participantId: string
) => {
  try {
    const response = await api.post(
      `/mabar/${sessionId}/participants/${participantId}/approve`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal menyetujui peserta"
    );
  }
};

// ==================== REJECT PARTICIPANT ====================
/**
 * Menolak peserta yang pending/awaiting_approval
 * Endpoint: POST /api/mabar/:sessionId/participants/:participantId/reject
 */
export const rejectParticipant = async (
  sessionId: string,
  participantId: string
) => {
  try {
    const response = await api.post(
      `/mabar/${sessionId}/participants/${participantId}/reject`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal menolak peserta");
  }
};

// ==================== REMOVE PARTICIPANT ====================
/**
 * Menghapus peserta dari sesi
 * Endpoint: DELETE /api/mabar/:sessionId/participants/:participantId
 */
export const removeParticipant = async (
  sessionId: string,
  participantId: string
) => {
  try {
    const response = await api.delete(
      `/mabar/${sessionId}/participants/${participantId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Gagal menghapus peserta");
  }
};

// ==================== ADD GUEST PARTICIPANT ====================
/**
 * Menambahkan peserta guest (tanpa akun) ke sesi
 * Endpoint: POST /api/mabar/:sessionId/participants/guest
 */
export const addGuestParticipant = async (
  sessionId: string,
  data: AddGuestData
) => {
  try {
    const response = await api.post(
      `/mabar/${sessionId}/participants/guest`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal menambahkan peserta guest"
    );
  }
};

// ==================== UPLOAD PAYMENT PROOF (sudah ada) ====================
export const uploadPaymentProof = async (sessionId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append("payment_proof", file);

    const response = await api.post(
      `/mabar/${sessionId}/upload-payment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal upload bukti pembayaran"
    );
  }
};

export default async function cancelMabarSession(sessionId: number) {
  try {
    const response = await api.post(`api/mabar-participants/cancel`, {
      mabar_participant_id: sessionId, // dikirim lewat body
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal membatalkan sesi mabar"
    );
  }
}
