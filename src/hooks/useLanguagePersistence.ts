"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export default function useLanguagePersistence() {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Persist language changes to localStorage
    const handleLanguageChange = (lng: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("i18nextLng", lng)
      }
    }

    i18n.on("languageChanged", handleLanguageChange)

    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [i18n])
}
