import { X } from "lucide-react";

// ✅ Modal untuk melihat bukti pembayaran
export const ProofPreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white flex items-center justify-between">
          <h3 className="text-lg font-bold">Bukti Pembayaran</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 bg-gray-50">
          <img
            src={imageUrl}
            alt="Bukti Pembayaran"
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
        </div>
        <div className="p-4 bg-white border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
