// ============================================
// src/components/LoadingScreen.tsx
"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0A0A0A] z-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
          Nexachain
        </h2>
        <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">Loading...</p>
      </div>
    </div>
  );
}