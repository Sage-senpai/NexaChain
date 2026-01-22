// src/components/CertificateModal.tsx
"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, ZoomIn, ZoomOut, Award } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CertificateModal({ isOpen, onClose }: CertificateModalProps) {
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      setIsZoomed(false)
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = "/images/certificate.jpg"
    link.download = "nexachain-certificate.jpg"
    link.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative bg-white dark:bg-[#1A1A1A] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#D4AF37]/30 ${
              isZoomed ? "max-w-6xl w-full max-h-[95vh]" : "max-w-3xl w-full max-h-[90vh]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">
                    Company Certificate
                  </h3>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                    Official Registration & Compliance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-2 hover:bg-[#D4AF37]/10 rounded-full transition-colors"
                  aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                >
                  {isZoomed ? (
                    <ZoomOut className="w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
                  ) : (
                    <ZoomIn className="w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-[#D4AF37]/10 rounded-full transition-colors"
                  aria-label="Download certificate"
                >
                  <Download className="w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-red-500/10 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
                </button>
              </div>
            </div>

            {/* Certificate Image */}
            <div className={`overflow-auto ${isZoomed ? "max-h-[calc(95vh-80px)]" : "max-h-[calc(90vh-80px)]"}`}>
              <div className="relative w-full min-h-[400px] bg-[#F8F9FA] dark:bg-[#0A0A0A]">
                <Image
                  src="/images/certificate.jpg"
                  alt="Nexachain Company Certificate"
                  fill
                  className={`object-contain ${isZoomed ? "object-contain" : "object-contain"}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] text-center sm:text-left">
                  This certificate verifies Nexachain's official registration and regulatory compliance.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
