// lib/hooks/useMabarActions.ts
import { useMabarStore } from "@/lib/store/useMabarEditStore";
import {
  approveParticipant,
  rejectParticipant,
  removeParticipant,
  addGuestParticipant,
  updateMabarSession,
} from "../services/mabar-edit.service";

export function useMabarActions(
  sessionId: string | null,
  mutate: () => Promise<any>
) {
  const {
    editForm,
    coverImageFile,
    setIsUpdating,
    setEditMode,
    setCoverImageFile,
    closeAddModal,
  } = useMabarStore();

  // Save session
  const saveSession = async () => {
    if (!sessionId) return;

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", editForm.title);
      formData.append("description", editForm.description || "");
      formData.append("slots_total", editForm.slots_total.toString());
      formData.append("price_per_slot", editForm.price_per_slot.toString());
      formData.append(
        "payment_instructions",
        editForm.payment_instructions || ""
      );

      if (coverImageFile) {
        formData.append("cover_image", coverImageFile);
      }

      await updateMabarSession(sessionId, formData);
      await mutate();

      setEditMode(false);
      setCoverImageFile(null);

      alert("✅ Sesi berhasil diperbarui!");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Gagal menyimpan perubahan");
    } finally {
      setIsUpdating(false);
    }
  };

  // Approve participant
  const handleApprove = async (participantId: string) => {
    if (!sessionId) return;
    if (!confirm("Setujui peserta ini?")) return;

    try {
      await approveParticipant(sessionId, participantId);
      await mutate();
      alert("✅ Peserta berhasil disetujui!");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Gagal menyetujui peserta");
    }
  };

  // Reject participant
  const handleReject = async (participantId: string) => {
    if (!sessionId) return;
    if (!confirm("Tolak peserta ini? Bukti pembayaran akan dihapus.")) return;

    try {
      await rejectParticipant(sessionId, participantId);
      await mutate();
      alert("✅ Peserta berhasil ditolak!");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Gagal menolak peserta");
    }
  };

  // Delete participant
  const handleDelete = async (participantId: string) => {
    if (!sessionId) return;
    if (
      !confirm(
        "Yakin ingin menghapus peserta ini? Tindakan ini tidak dapat dibatalkan."
      )
    )
      return;

    try {
      await removeParticipant(sessionId, participantId);
      await mutate();
      alert("✅ Peserta berhasil dihapus!");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Gagal menghapus peserta");
    }
  };

  // Add guest participant
  const handleAddGuest = async (data: { guest_name: string }) => {
    if (!sessionId) return;

    try {
      await addGuestParticipant(sessionId, data);
      await mutate();
      closeAddModal();
      alert("✅ Peserta guest berhasil ditambahkan!");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Gagal menambahkan peserta guest");
      throw error;
    }
  };

  return {
    saveSession,
    handleApprove,
    handleReject,
    handleDelete,
    handleAddGuest,
  };
}
