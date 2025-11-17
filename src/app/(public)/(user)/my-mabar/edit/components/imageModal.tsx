import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

export function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageUrl}
            alt="Payment Proof"
            className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
          />
          <div className="mt-4 flex gap-3 justify-center">
            <a
              href={imageUrl}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold transition-all"
            >
              Buka di Tab Baru
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
