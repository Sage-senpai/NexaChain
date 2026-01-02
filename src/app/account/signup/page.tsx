"use client"

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

export default function SignUpPage() {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [referralCode, setReferralCode] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const ref = urlParams.get("ref")
      if (ref) setReferralCode(ref)
    }
  }, [])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password || !fullName) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          phone: phone || null,
          referral_code: `NXC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          referred_by: referralCode || null,
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }

        if (phone) localStorage.setItem("pendingPhone", phone)
        if (referralCode) localStorage.setItem("pendingReferralCode", referralCode)

        router.push("/onboarding")
        router.refresh()
      }
    } catch (err: any) {
      console.error("Sign up error:", err)
      const errorMessage = err.message || "Something went wrong. Please try again."

      if (errorMessage.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.")
      } else {
        setError(errorMessage)
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={onSubmit}
        className="form-container rounded-2xl bg-white dark:bg-[#1A1A1A]"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">
            {t("auth.joinNexachain")}
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("auth.signUpTagline")}</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              {t("auth.fullName")} *
            </label>
            <input
              required
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              placeholder={t("auth.enterFullName")}
              className="form-input rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">{t("auth.email")} *</label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder={t("auth.enterEmail")}
              className="form-input rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              {t("auth.phoneNumber")}
            </label>
            <input
              name="phone"
              type="tel"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              placeholder={t("auth.enterPhoneNumber")}
              className="form-input rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              {t("auth.password")} *
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder={t("auth.createPassword")}
              className="form-input rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          {referralCode && (
            <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <p className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                ✨ {t("auth.referredBy")}: <span className="font-bold text-[#D4AF37]">{referralCode}</span>
              </p>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="form-button bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.creatingAccount") : t("nav.signup")}
          </button>

          <p className="text-center text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
            {t("auth.alreadyHaveAccount")}{" "}
            <a href="/account/signin" className="text-[#D4AF37] hover:text-[#FFD700] font-semibold">
              {t("nav.signin")}
            </a>
          </p>
        </div>
      </motion.form>
    </div>
  )
}
