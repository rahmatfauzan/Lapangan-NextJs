import { Loader2, UserX, XCircle } from "lucide-react";

// ✅ Modal konfirmasi cancel
export const CancelConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Batalkan Partisipasi</h3>
              <p className="text-sm text-red-100 mt-1">
                Anda yakin ingin membatalkan?
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Perhatian!
                </p>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• Anda akan dibatalkan dari mabar ini</li>
                  <li>• Slot Anda akan tersedia untuk peserta lain</li>
                  <li>• Tindakan ini tidak dapat dibatalkan</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Apakah Anda yakin ingin membatalkan partisipasi dari mabar ini?
          </p>
        </div>
        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            disabled={isLoading}
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membatalkan...
              </>
            ) : (
              <>
                <UserX className="w-4 h-4" />
                Ya, Batalkan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
