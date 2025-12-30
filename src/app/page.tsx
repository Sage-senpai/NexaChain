// src/app/page.tsx - FIXED VERSION (No more hanging!)
"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  DollarSign,
  Award,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import AnimatedCounter from "@/components/AnimatedCounter"
import LiveCryptoFeed from "@/components/LiveCryptoFeed"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import MobileNav from "@/components/MobileNav"
import TestimonialsModal from "@/components/TestimonialsModal"

interface InvestmentPlan {
  name: string
  emoji: string
  dailyROI: number
  totalROI: number
  duration: number
  minAmount: number
  maxAmount: number | null
  referralBonus: number
}

export default function LandingPage() {
  const [showTestimonials, setShowTestimonials] = useState(false)
  const [showCryptoFeed, setShowCryptoFeed] = useState(true)
  const { t, ready, i18n } = useTranslation()

  // ✅ Single loading state
  const [isInitialized, setIsInitialized] = useState(false)

  // ✅ Wait for BOTH translation AND client mount
  useEffect(() => {
    if (ready && typeof window !== "undefined") {
      // Small delay to ensure smooth render
      const timer = setTimeout(() => {
        setIsInitialized(true)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [ready])

  // ✅ Memoize static data to prevent re-renders
  const plans: InvestmentPlan[] = useMemo(
    () => [
      {
        name: "Beginner Plan",
        emoji: "🔰",
        dailyROI: 5,
        totalROI: 5,
        duration: 1,
        minAmount: 50,
        maxAmount: 499,
        referralBonus: 5,
      },
      {
        name: "Silver Plan",
        emoji: "🪙",
        dailyROI: 10,
        totalROI: 10,
        duration: 1,
        minAmount: 500,
        maxAmount: 999,
        referralBonus: 5,
      },
      {
        name: "Gold Plan",
        emoji: "🏆",
        dailyROI: 20,
        totalROI: 20,
        duration: 2,
        minAmount: 1000,
        maxAmount: 4999,
        referralBonus: 5,
      },
      {
        name: "VIP Membership",
        emoji: "💎",
        dailyROI: 35,
        totalROI: 35,
        duration: 4,
        minAmount: 5000,
        maxAmount: null,
        referralBonus: 5,
      },
      {
        name: "Long Term Investment",
        emoji: "📈",
        dailyROI: 3,
        totalROI: 90,
        duration: 30,
        minAmount: 155,
        maxAmount: 5555,
        referralBonus: 5,
      },
    ],
    [],
  )

  const stats = useMemo(
    () => [
      { label: t("stats.activeUsers"), value: 5076, icon: Users },
      { label: t("stats.totalInvestments"), value: 10000000, icon: TrendingUp, prefix: "$" },
      { label: t("stats.countries"), value: 48, icon: Award, suffix: "+" },
      { label: t("stats.roiPaid"), value: 2500000, icon: DollarSign, prefix: "$" },
    ],
    [t],
  )

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // ✅ Improved loading screen - faster render
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#D4AF37] font-semibold text-sm">Loading Nexachain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 bg-white dark:bg-[#0A0A0A]">
                <button
                  onClick={() => scrollToSection("plans")}
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t("nav.plans")}
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t("nav.about")}
                </button>
                <button
                  onClick={() => scrollToSection("services")}
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t("nav.services")}
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t("nav.contact")}
                </button>
                <a
                  href="/account/signin"
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t("nav.signin")}
                </a>
                <a
                  href="/account/signup"
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {t("nav.signup")}
                </a>
              </nav>
              <LanguageSwitcher />
              <div className="md:hidden">
                <MobileNav
                  links={[
                    { label: t("nav.plans"), onClick: () => scrollToSection("plans") },
                    { label: t("nav.about"), onClick: () => scrollToSection("about") },
                    { label: t("nav.services"), onClick: () => scrollToSection("services") },
                    { label: t("nav.contact"), onClick: () => scrollToSection("contact") },
                    { label: t("nav.signin"), href: "/account/signin" },
                  ]}
                  ctaText={t("nav.signup")}
                  ctaHref="/account/signup"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#F8F9FA] dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block mb-6 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full"
          >
            <span className="text-[#D4AF37] font-semibold text-sm">{t("hero.badge")}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent"
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xl md:text-2xl text-[#4A4A4A] dark:text-[#B8B8B8] mb-8 max-w-3xl mx-auto"
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-[#6B7280] dark:text-[#B8B8B8] mb-12 max-w-2xl mx-auto"
          >
            {t("hero.description")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/account/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all inline-flex items-center justify-center"
            >
              {t("hero.openDeposit")} <ArrowRight className="ml-2" />
            </a>
            <button
              onClick={() => scrollToSection("plans")}
              className="px-8 py-4 border-2 border-[#D4AF37] text-[#000000] dark:text-[#FFFFFF] text-lg font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
            >
              {t("hero.viewPlans")}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Crypto Feed */}
      <div className="border-y border-[#D4AF37]/20 bg-[#1A1A1A] dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => setShowCryptoFeed(!showCryptoFeed)}
            className="w-full py-3 flex items-center justify-between text-[#D4AF37] hover:text-[#FFD700] transition-colors"
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
            >
              <LiveCryptoFeed />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <section className="py-20 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.button
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowTestimonials(true)}
                  className="p-6 rounded-xl bg-[#F8F9FA] dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all cursor-pointer text-center"
                >
                  <Icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                  <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                    {stat.prefix}
                    <AnimatedCounter end={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{stat.label}</div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-[#F8F9FA] dark:bg-[#1A1A1A] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{t("plans.title")}</h2>
            <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">{t("plans.subtitle")}</p>
            <div className="mt-6 inline-block px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                <span className="font-bold text-[#D4AF37]">No account opening fees</span> •
                <span className="ml-2 font-bold text-[#D4AF37]">No deposit commissions</span>
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-2xl transition-all"
              >
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{p.name}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>{t("plans.dailyROI")}:</span>
                    <span className="text-[#D4AF37] font-bold">{p.dailyROI}%</span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>{t("plans.totalROI")}:</span>
                    <span className="text-[#10B981] font-bold">{p.totalROI}%</span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>{t("plans.duration")}:</span>
                    <span>
                      {p.duration} {p.duration === 1 ? t("plans.day") : t("plans.days")}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#D4AF37]/20 text-center">
                    <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                      ${p.minAmount.toLocaleString()}
                    </span>
                    <span className="mx-2 text-[#D4AF37]">—</span>
                    {p.maxAmount ? (
                      <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                        ${p.maxAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="font-bold text-[#D4AF37]">Unlimited</span>
                    )}
                  </div>
                </div>
                <a
                  href="/account/signup"
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-xl transition-all flex items-center justify-center group"
                >
                  {t("plans.investNow")}{" "}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-[#0A0A0A] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{t("about.title")}</h2>
            <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8] max-w-3xl mx-auto">{t("about.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Shield, titleKey: "about.tradingBot.title", descKey: "about.tradingBot.desc" },
              { icon: TrendingUp, titleKey: "about.automated.title", descKey: "about.automated.desc" },
              { icon: Users, titleKey: "about.support.title", descKey: "about.support.desc" },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{t(item.titleKey)}</h3>
                  <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{t(item.descKey)}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{t("about.howItWorks")}</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((step) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: step * 0.1 }}
                  className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {step}
                  </div>
                  <h4 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                    {t(`about.step${step}.title`)}
                  </h4>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{t(`about.step${step}.desc`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white dark:bg-[#0A0A0A] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{t("contact.title")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Mail, titleKey: "contact.email", text: "support@nexachain.com" },
              { icon: Phone, titleKey: "contact.phone", text: "UK: +44 7878345807\nSA: +27 78 720 8949" },
              { icon: MapPin, titleKey: "contact.location", text: "United Kingdom" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.titleKey}
                  className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20"
                >
                  <Icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                  <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">{t(item.titleKey)}</h3>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] whitespace-pre-line">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] dark:bg-[#0A0A0A] border-t border-[#D4AF37]/20 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4">Nexachain</h3>
              <p className="text-[#B8B8B8]">{t("footer.tagline")}</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t("footer.quickLinks")}</h4>
              <ul className="space-y-2">
                {["plans", "about", "services", "contact"].map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => scrollToSection(s)}
                      className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors capitalize"
                    >
                      {t(`nav.${s}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t("footer.legal")}</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/legal" className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors">
                    {t("footer.terms")}
                  </a>
                </li>
                <li>
                  <a href="/legal" className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors">
                    {t("footer.privacy")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t("footer.support")}</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/faq" className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors">
                    {t("footer.faq")}
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    {t("footer.helpCenter")}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#D4AF37]/20 text-center text-[#B8B8B8]">
            <p>&copy; 2025 Nexachain. {t("footer.copyright")}</p>
          </div>
        </div>
      </footer>

      <TestimonialsModal isOpen={showTestimonials} onClose={() => setShowTestimonials(false)} />

      {/* Floating Contact Buttons */}
      <div className="floating-contact-buttons">
        <a
          href="https://wa.me/+447878345807?text=Hello%2C%20I%27m%20interested%20in%20Nexachain%20investments"
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn floating-whatsapp"
          data-tooltip="Chat with a Nexachain Admin on WhatsApp"
          aria-label="Contact us on WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        <a
          href="https://t.me/Nexachainad"
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn floating-telegram"
          data-tooltip="Message NexaChain Admin on Telegram"
          aria-label="Contact us on Telegram"
        >
          <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
