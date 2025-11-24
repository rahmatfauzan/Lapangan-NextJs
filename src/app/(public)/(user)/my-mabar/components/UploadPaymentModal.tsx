"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UploadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function UploadPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  isUploading,
}: UploadPaymentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validasi tipe file
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Format file tidak valid. Gunakan JPEG, PNG, JPG, atau WEBP");
      return;
    }

    // Validasi ukuran file (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("Ukuran file terlalu besar. Maksimal 2MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu");
      return;
    }

    try {
      await onSubmit(selectedFile);
      // Reset state setelah berhasil
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      // Error handling sudah ada di parent component
      console.error("Upload error:", error);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Upload Bukti Pembayaran
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload bukti transfer untuk konfirmasi pembayaran
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isUploading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Upload Area */}
                <div className="space-y-4">
                  {/* Drag & Drop Area */}
                  {!previewUrl ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
                        ${
                          dragActive
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-orange-100 rounded-full">
                          <Upload className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            Klik atau drag file ke sini
                          </p>
                          <p className="text-sm text-gray-600">
                            Format: JPEG, PNG, JPG, WEBP (Max 2MB)
                          </p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleChange}
                        disabled={isUploading}
                      />
                    </div>
                  ) : (
                    /* Preview Area */
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                        {!isUploading && (
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {selectedFile && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <ImageIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info Alert */}
                  <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Petunjuk Upload:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Pastikan bukti transfer terlihat jelas</li>
                        <li>• Nominal dan tanggal transfer harus terlihat</li>
                        <li>• Foto tidak blur atau terpotong</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleClose}
                    disabled={isUploading}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
