// src/app/dashboard/withdrawal/page.tsx
"use client"
import { useState, type FormEvent } from "react"
import { useTranslation } from "react-i18next"
import useUser from "@/utils/useUser"
import LoadingScreen from "@/components/LoadingScreen"
import { ArrowLeft, Wallet, Check } from "lucide-react"

export default function WithdrawPage() {
  const { t } = useTranslation()
  const { data: user, loading: userLoading } = useUser()
  const [amount, setAmount] = useState("")
  const [cryptoType, setCryptoType] = useState("BTC")
  const [walletAddress, setWalletAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!amount || !walletAddress) {
      setError("Please fill in all fields")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (numAmount <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          crypto_type: cryptoType,
          wallet_address: walletAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit withdrawal")
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 3000)
    } catch (err) {
      console.error("Error submitting withdrawal:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to submit withdrawal. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin"
    }
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{t("withdrawal.success")}</h2>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-6">{t("withdrawal.successDesc")}</p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
          >
            {t("nav.backToDashboard")}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/dashboard"
              className="flex items-center gap-2 text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t("nav.backToDashboard")}</span>
            </a>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
          </div>
        </div>
      </nav>

      <div className="responsive-container py-12" style={{ maxWidth: "48rem" }}>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF]">{t("withdrawal.title")}</h2>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("withdrawal.tagline")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-[#4A4A4A] dark:text-[#B8B8B8] mb-2">{t("withdrawal.amount")}</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t("withdrawal.amount")}
                className="w-full px-4 py-4 text-xl font-bold rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Crypto Selection */}
            <div>
              <label className="block text-[#4A4A4A] dark:text-[#B8B8B8] mb-2">{t("withdrawal.crypto")}</label>
              <div className="crypto-selector-grid">
                {["BTC", "ETH", "USDT", "SOL"].map((crypto) => (
                  <div
                    key={crypto}
                    onClick={() => setCryptoType(crypto)}
                    className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${cryptoType === crypto ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#D4AF37]/20 hover:border-[#D4AF37]/50"}`}
                  >
                    <div className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">{crypto}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-[#4A4A4A] dark:text-[#B8B8B8] mb-2">
                {t("withdrawal.walletAddress", { crypto: cryptoType })}
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={t("withdrawal.enterWallet", { crypto: cryptoType })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none font-mono text-sm"
              />
            </div>

            {/* Notice */}
            <div className="p-4 rounded-lg bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F]">
              <h4 className="font-bold text-[#92400E] dark:text-[#FCD34D] mb-2">{t("withdrawal.notice")}</h4>
              <ul className="text-sm text-[#92400E] dark:text-[#FCD34D] space-y-1">
                <li>• {t("withdrawal.processing")}</li>
                <li>• {t("withdrawal.minimum")}</li>
                <li>• {t("withdrawal.doubleCheck")}</li>
                <li>• {t("withdrawal.networkFees")}</li>
              </ul>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !amount || !walletAddress}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold text-lg rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("withdrawal.submitting") : t("withdrawal.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
