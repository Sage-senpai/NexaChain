// FILE: src/app/dashboard/page.tsx k
"use client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import useUser from "@/utils/useUser"
import useAdmin from "@/utils/useAdmin"
import LoadingScreen from "@/components/LoadingScreen"
import AnimatedCounter from "@/components/AnimatedCounter"
import LiveCryptoFeed from "@/components/LiveCryptoFeed"
import LiveCryptoGraph from "@/components/LiveCryptoGraph"
import UserMessagePanel from "@/components/messaging/UserMessagePanel"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { createClient } from "@/lib/supabase/client"
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  Users,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  LogOut,
  Shield,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: user, loading: userLoading } = useUser()
  const { isAdmin } = useAdmin()
  const [profile, setProfile] = useState<any>(null)
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showCryptoFeed, setShowCryptoFeed] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, investmentsRes] = await Promise.all([fetch("/api/profile"), fetch("/api/investments")])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data.profile)
        }

        if (investmentsRes.ok) {
          const data = await investmentsRes.json()
          setInvestments(data.investments || [])
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

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

  const stats = [
    {
      label: t("dashboard.accountBalance"),
      value: profile?.account_balance || 0,
      icon: Wallet,
      prefix: "$",
    },
    {
      label: t("dashboard.totalInvested"),
      value: profile?.total_invested || 0,
      icon: TrendingUp,
      prefix: "$",
    },
    {
      label: t("dashboard.totalWithdrawn"),
      value: profile?.total_withdrawn || 0,
      icon: ArrowDownCircle,
      prefix: "$",
    },
    {
      label: t("dashboard.referralBonus"),
      value: profile?.total_referral_bonus || 0,
      icon: Users,
      prefix: "$",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      {/* Header */}
      <nav className="navbar-container border-b border-[#D4AF37]/20 bg-white dark:bg-[#1A1A1A]">
        <div className="responsive-container">
          <div className="navbar-content">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
            <div className="flex items-center gap-4">
              <span className="text-responsive-sm text-[#4A4A4A] dark:text-[#B8B8B8] hide-mobile">
                {t("dashboard.welcome")}, {profile?.full_name || user.email?.split("@")[0]}
              </span>
              <LanguageSwitcher />
              {isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Shield className="w-4 h-4" />
                  {t("nav.admin")}
                </a>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Live Crypto Feed - Collapsible Ticker */}
      <div className="border-b border-[#D4AF37]/20 bg-[#1A1A1A] dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowCryptoFeed(!showCryptoFeed)}
            className="w-full py-2 flex items-center justify-between text-[#D4AF37] hover:text-[#FFD700] transition-colors"
          >
            <span className="text-sm font-semibold">📊 Live Market Ticker</span>
            {showCryptoFeed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {showCryptoFeed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <LiveCryptoFeed />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="dashboard-grid mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
                  {stat.prefix}
                  <AnimatedCounter end={stat.value} />
                </div>
                <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* LIVE CRYPTO GRAPH */}
        <div className="mb-8">
          <LiveCryptoGraph />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-grid mb-8">
          <a
            href="/dashboard/fund"
            className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] p-6 rounded-2xl text-white hover:shadow-2xl transition-all"
          >
            <h3 className="text-xl font-bold mb-2">{t("dashboard.makeDeposit.title")}</h3>
            <p className="text-white/90">{t("dashboard.makeDeposit.desc")}</p>
          </a>
          <a
            href="/dashboard/withdrawal"
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
              {t("dashboard.withdrawFunds.title")}
            </h3>
            <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("dashboard.withdrawFunds.desc")}</p>
          </a>
          <a
            href="/dashboard/referral"
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
              {t("dashboard.referrals.title")}
            </h3>
            <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("dashboard.referrals.desc")}</p>
          </a>
        </div>

        {/* Referral Link */}
        {profile?.referral_code && (
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 mb-8">
            <h3 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
              {t("dashboard.yourReferralLink")}
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/account/signup?ref=${profile.referral_code}`}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF]"
              />
              <button
                onClick={copyReferralLink}
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? t("dashboard.copied") : t("dashboard.copy")}
              </button>
            </div>
          </div>
        )}

        {/* Active Investments */}
        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
          <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
            {t("dashboard.activeInvestments")}
          </h3>
          {investments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">{t("dashboard.noInvestments")}</p>
              <a
                href="/dashboard/fund"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
              >
                {t("dashboard.makeFirstDeposit")}
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {investments.map((inv: any) => (
                <div key={inv.id} className="p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{inv.plan_emoji}</span>
                      <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">{inv.plan_name}</span>
                    </div>
                    <span className="text-[#D4AF37] font-bold">
                      {inv.daily_roi}% {t("plans.dailyROI")}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("dashboard.principal")}:</span>
                      <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                        ${Number.parseFloat(inv.principal_amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("dashboard.currentValue")}:</span>
                      <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                        ${Number.parseFloat(inv.current_value).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t("dashboard.expectedReturn")}:</span>
                      <span className="font-semibold text-[#10B981]">
                        ${Number.parseFloat(inv.expected_return).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <UserMessagePanel />
    </div>
  )
}
