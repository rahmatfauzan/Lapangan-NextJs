// app/host-mabar/components/EditModeHeader.tsx
import React from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Upload } from "lucide-react";
import { useMabarStore } from "@/lib/store/useMabarEditStore";

interface EditModeHeaderProps {
  onSave: () => void;
}

export function EditModeHeader({ onSave }: EditModeHeaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    editForm,
    isUpdating,
    coverImagePreview,
    updateEditForm,
    setCoverImageFile,
    setCoverImagePreview,
    removeCoverImage,
    cancelEdit,
  } = useMabarStore();

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB!");
      return;
    }

    setCoverImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="grid md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => updateEditForm({ title: e.target.value })}
            className="w-full px-4 py-2.5 text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Judul Sesi"
            disabled={isUpdating}
          />
        </div>

        <div className="md:col-span-2">
          <textarea
            value={editForm.description}
            onChange={(e) => updateEditForm({ description: e.target.value })}
            className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            rows={2}
            placeholder="Deskripsi sesi..."
            disabled={isUpdating}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Total Slot
          </label>
          <input
            type="number"
            value={editForm.slots_total}
            onChange={(e) =>
              updateEditForm({ slots_total: parseInt(e.target.value) || 0 })
            }
            className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="10"
            min="1"
            disabled={isUpdating}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Harga per Slot (Rp)
          </label>
          <input
            type="number"
            value={editForm.price_per_slot}
            onChange={(e) =>
              updateEditForm({ price_per_slot: parseInt(e.target.value) || 0 })
            }
            className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="50000"
            min="0"
            disabled={isUpdating}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Cover Image
          </label>

          {coverImagePreview ? (
            <div className="relative">
              <img
                src={coverImagePreview}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeCoverImage}
                disabled={isUpdating}
                className="absolute top-2 right-2 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all shadow-lg disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
                disabled={isUpdating}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-purple-600 disabled:opacity-50"
              >
                <Upload className="w-8 h-8" />
                <span className="font-medium">Upload Cover Image</span>
                <span className="text-xs text-gray-500">
                  PNG, JPG up to 5MB
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Instruksi Pembayaran
          </label>
          <textarea
            value={editForm.payment_instructions}
            onChange={(e) =>
              updateEditForm({ payment_instructions: e.target.value })
            }
            className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            rows={3}
            placeholder="Contoh: Transfer ke BCA 1234567890 a/n John Doe"
            disabled={isUpdating}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-sm"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan
            </>
          )}
        </button>
        <button
          onClick={cancelEdit}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Batal
        </button>
      </div>
    </motion.div>
  );
}
