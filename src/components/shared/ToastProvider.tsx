// FILE: src/components/shared/ToastProvider.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, MessageCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "message" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id }]);

      // Auto-dismiss
      const duration = toast.duration ?? 5000;
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-[#10B981]" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-[#D4AF37]" />;
      case "info":
        return <Info className="w-5 h-5 text-[#3B82F6]" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-[#10B981]";
      case "error":
        return "border-[#EF4444]";
      case "message":
        return "border-[#D4AF37]";
      case "info":
        return "border-[#3B82F6]";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container - top right */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto bg-white dark:bg-[#1A1A1A] border-l-4 ${getBorderColor(toast.type)} rounded-lg shadow-2xl p-4`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-[#000000] dark:text-[#FFFFFF]">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-0.5 line-clamp-2">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 hover:bg-[#D4AF37]/10 rounded transition-all"
                >
                  <X className="w-4 h-4 text-[#4A4A4A] dark:text-[#B8B8B8]" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
