import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onSuccess?: (data: any) => void;
}

export const UploadPaymentModal: React.FC<UploadPaymentModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format file harus JPEG, PNG, JPG, atau WEBP");
      return;
    }

    // Validasi ukuran file (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 2MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    if (!sessionId) {
      setError("Session ID tidak valid");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("mabar_session_id", sessionId);
      formData.append("payment_proof_image", selectedFile);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch("/api/mabar-participants/upload-proof", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengunggah bukti pembayaran");
      }

      // Success callback
      if (onSuccess) {
        onSuccess(data);
      }

      // Reset form
      handleRemoveFile();

      // Close modal
      onClose();

      // Show success message
      if (typeof window !== "undefined") {
        const toastLib = (window as any).toast;
        if (toastLib && toastLib.success) {
          toastLib.success("Bukti pembayaran berhasil diunggah!");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengunggah";
      setError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Upload Bukti Bayar</h2>
                <p className="text-sm opacity-90 mt-1">
                  Unggah bukti transfer pembayaran
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isUploading}
                className="p-2 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Upload Area */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="payment-proof-upload"
                disabled={isUploading}
              />

              {!previewUrl ? (
                <label
                  htmlFor="payment-proof-upload"
                  className={`block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Klik untuk pilih gambar
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG, JPG, WEBP (max 2MB)
                  </p>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={previewUrl}
                      alt="Preview bukti bayar"
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="flex items-center gap-2 text-white">
                        <ImageIcon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate font-medium">
                            {selectedFile?.name}
                          </p>
                          <p className="text-xs opacity-80">
                            {selectedFile && formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-bold mb-2">Catatan Penting:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>
                      Pastikan bukti transfer <strong>jelas dan terbaca</strong>
                    </li>
                    <li>
                      Nominal transfer harus <strong>sesuai harga slot</strong>
                    </li>
                    <li>File berformat JPEG, PNG, JPG, atau WEBP</li>
                    <li>Ukuran file maksimal 2MB</li>
                    <li>Host akan memverifikasi dalam 1x24 jam</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || isUploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Upload Bukti</span>
                  </>
                )}
              </button>
            </div>

            {/* Upload Progress Indicator */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-medium">
                    Sedang mengunggah bukti pembayaran...
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
