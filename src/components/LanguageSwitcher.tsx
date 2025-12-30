// src/components/LanguageSwitcher.tsx
"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Globe, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import useLanguagePersistence from "@/hooks/useLanguagePersistence"

const languages = [
  { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "es", name: "Español", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "Français", flag: "🇫🇷", nativeName: "Français" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "pt", name: "Português", flag: "🇵🇹", nativeName: "Português" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "ar", name: "العربية", flag: "🇸🇦", nativeName: "العربية" },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [changing, setChanging] = useState(false)

  // Enable persistence hook
  useLanguagePersistence()

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  const changeLanguage = async (langCode: string) => {
    setChanging(true)
    try {
      await i18n.changeLanguage(langCode)
      setIsOpen(false)
    } catch (error) {
      console.error("Error changing language:", error)
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={changing}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] hover:bg-[#D4AF37]/10 transition-all disabled:opacity-50"
        aria-label="Change language"
      >
        <Globe className={`w-4 h-4 ${changing ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline text-sm font-semibold">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
        <span className="sm:hidden text-lg">{currentLanguage.flag}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-[#D4AF37]/20">
                <p className="text-xs font-semibold text-[#4A4A4A] dark:text-[#B8B8B8] uppercase tracking-wide">
                  Select Language
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    disabled={changing}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#D4AF37]/10 transition-all disabled:opacity-50 ${
                      i18n.language === lang.code ? "bg-[#D4AF37]/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left">
                        <div className="font-medium text-[#000000] dark:text-[#FFFFFF]">{lang.nativeName}</div>
                        <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">{lang.name}</div>
                      </div>
                    </div>
                    {i18n.language === lang.code && <Check className="w-5 h-5 text-[#D4AF37]" />}
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A]">
                <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] text-center">
                  Language preference saved automatically
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
