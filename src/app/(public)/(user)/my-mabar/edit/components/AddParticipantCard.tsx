import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X, Loader2 } from "lucide-react";

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { guest_name: string; }) => Promise<void>;
}

export function AddParticipantModal({
  isOpen,
  onClose,
  onAdd,
}: AddParticipantModalProps) {
  const [formData, setFormData] = useState({
    guest_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.guest_name.trim()) {
      setError("Nama wajib diisi");
      return;
    }


    setIsSubmitting(true);
    try {
      await onAdd(formData);
      setFormData({ guest_name: "" });
      onClose();
    } catch (err) {
      setError("Gagal menambahkan peserta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ guest_name: "" });
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Tambah Peserta Guest</h2>
                  <p className="text-sm opacity-90">Masukkan data peserta</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.guest_name}
                onChange={(e) =>
                  setFormData({ ...formData, guest_name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Masukkan nama lengkap"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Tambahkan
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}