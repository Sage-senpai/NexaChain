"use client"
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react"
import useUser from "@/utils/useUser"
import { useTranslation } from "react-i18next"

interface OnboardingFormData {
  phone: string
  city: string
  state: string
  country: string
  referralCode: string
}

export default function OnboardingPage() {
  const { t } = useTranslation()
  const { data: user, loading: userLoading } = useUser()
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<OnboardingFormData>({
    phone: "",
    city: "",
    state: "",
    country: "United Kingdom",
    referralCode: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingPhone = localStorage.getItem("pendingPhone")
      const pendingReferralCode = localStorage.getItem("pendingReferralCode")

      if (pendingPhone && !formData.phone) {
        setFormData((prev) => ({ ...prev, phone: pendingPhone }))
      }
      if (pendingReferralCode && !formData.referralCode) {
        setFormData((prev) => ({ ...prev, referralCode: pendingReferralCode }))
      }
    }
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          referredBy: formData.referralCode || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to complete onboarding")
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingPhone")
        localStorage.removeItem("pendingReferralCode")
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    } catch (err) {
      console.error(err)
      setError("Failed to complete onboarding. Please try again.")
      setLoading(false)
    }
  }

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="text-[#D4AF37] text-xl">{t("common.loading")}</div>
      </div>
    )
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin"
    }
    return null
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">{t("onboarding.success")}</h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("onboarding.redirecting")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
      <form onSubmit={handleSubmit} className="onboarding-form rounded-2xl bg-white dark:bg-[#1A1A1A]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">
            {t("onboarding.title")}
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("onboarding.tagline")}</p>
        </div>

        <div className="space-y-5">
          <div className="onboarding-grid">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                {t("onboarding.phone")}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("onboarding.enterPhone")}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                {t("onboarding.city")}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t("onboarding.enterCity")}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="onboarding-grid">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                {t("onboarding.state")}
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder={t("onboarding.enterState")}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                {t("onboarding.country")}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder={t("onboarding.enterCountry")}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl transition-all disabled:opacity-50"
          >
            {loading ? t("onboarding.saving") : t("onboarding.continue")}
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full py-3 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] text-lg font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
          >
            {t("onboarding.skip")}
          </button>
        </div>
      </form>
    </div>
  )
}
