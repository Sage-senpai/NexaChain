// src/app/dashboard/referral/page.tsx
"use client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import useUser from "@/utils/useUser"
import LoadingScreen from "@/components/LoadingScreen"
import AnimatedCounter from "@/components/AnimatedCounter"
import { ArrowLeft, Users, Copy, Check, Gift } from "lucide-react"

interface Profile {
  referral_code?: string
}

interface Referral {
  id: string
  bonus_amount: string | number
  status: string
  created_at: string
}

export default function ReferralsPage() {
  const { t } = useTranslation()
  const { data: user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, referralsRes] = await Promise.all([fetch("/api/profile"), fetch("/api/referrals")])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data.profile)
        }

        if (referralsRes.ok) {
          const data = await referralsRes.json()
          setReferrals(data.referrals || [])
        }
      } catch (err) {
        console.error("Error fetching referrals:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      const link = `${window.location.origin}/account/signup?ref=${profile.referral_code}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (userLoading || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin"
    }
    return null
  }

  const totalEarned = referrals.reduce((sum, ref) => sum + Number.parseFloat(ref.bonus_amount?.toString() || "0"), 0)
  const paidReferrals = referrals.filter((r) => r.status === "paid").length

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Stats */}
        <div className="referral-stats-grid mb-8">
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              <AnimatedCounter end={referrals.length} />
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t("referral.totalReferrals")}</div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              $<AnimatedCounter end={totalEarned} />
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t("referral.totalEarned")}</div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <Check className="w-8 h-8 text-[#10B981]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              <AnimatedCounter end={paidReferrals} />
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t("referral.activeReferrals")}</div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t("referral.shareLink")}</h2>
          <p className="text-white/90 mb-6">{t("referral.earnCommission")}</p>
          <div className="referral-link-container">
            <input
              type="text"
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/account/signup?ref=${profile?.referral_code || ""}`}
              readOnly
              className="flex-1 rounded-lg bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/60 font-mono text-sm"
            />
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-white text-[#D4AF37] rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? t("dashboard.copied") : t("dashboard.copy")}
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-[#1A1A1A] p-8 rounded-2xl border-2 border-[#D4AF37]/20 mb-8">
          <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">{t("referral.howItWorks")}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">{t("referral.step1.title")}</h4>
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t("referral.step1.desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">{t("referral.step2.title")}</h4>
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t("referral.step2.desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">{t("referral.step3.title")}</h4>
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t("referral.step3.desc")}</p>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white dark:bg-[#1A1A1A] p-8 rounded-2xl border-2 border-[#D4AF37]/20">
          <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">{t("referral.yourReferrals")}</h3>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">{t("referral.noReferrals")}</p>
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t("referral.shareToEarn")}</p>
            </div>
          ) : (
            <div className="admin-table-container custom-scrollbar">
              <table className="admin-table">
                <thead>
                  <tr className="border-b border-[#D4AF37]/20">
                    <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      {t("referral.date")}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      {t("referral.bonusAmount")}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      {t("referral.status")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="border-b border-[#D4AF37]/10">
                      <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-[#10B981] font-semibold">
                        ${Number.parseFloat(ref.bonus_amount?.toString() || "0").toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${ref.status === "paid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#D4AF37]/10 text-[#D4AF37]"}`}
                        >
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
