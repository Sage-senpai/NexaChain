// src/app/legal/page.tsx
"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Eye } from "lucide-react"

export default function LegalPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      {/* Navbar */}
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/"
              className="flex items-center gap-2 text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t("common.backToHome")}</span>
            </a>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4">
            {t("legal.title")}
          </h1>
          <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">{t("legal.subtitle")}</p>
        </motion.div>

        {/* Tabs */}
        <div className="legal-tabs mb-8">
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-4 rounded-xl font-bold transition-all ${
              activeTab === "terms"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white"
                : "bg-white dark:bg-[#1A1A1A] text-[#000000] dark:text-[#FFFFFF] border-2 border-[#D4AF37]/20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              {t("legal.termsOfService")}
            </div>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-4 rounded-xl font-bold transition-all ${
              activeTab === "privacy"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white"
                : "bg-white dark:bg-[#1A1A1A] text-[#000000] dark:text-[#FFFFFF] border-2 border-[#D4AF37]/20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" />
              {t("legal.privacyPolicy")}
            </div>
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="legal-content bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20"
        >
          {activeTab === "terms" ? (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-6">{t("legal.termsOfService")}</h2>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">{t("legal.lastUpdated")}: November 22, 2025</p>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  1. {t("legal.terms.acceptance.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.terms.acceptance.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  2. {t("legal.terms.eligibility.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed mb-2">
                  {t("legal.terms.eligibility.intro")}
                </p>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>{t("legal.terms.eligibility.item1")}</li>
                  <li>{t("legal.terms.eligibility.item2")}</li>
                  <li>{t("legal.terms.eligibility.item3")}</li>
                  <li>{t("legal.terms.eligibility.item4")}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  3. {t("legal.terms.risks.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">{t("legal.terms.risks.content")}</p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  4. {t("legal.terms.security.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.terms.security.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  5. {t("legal.terms.deposits.title")}
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>{t("legal.terms.deposits.item1")}</li>
                  <li>{t("legal.terms.deposits.item2")}</li>
                  <li>{t("legal.terms.deposits.item3")}</li>
                  <li>{t("legal.terms.deposits.item4")}</li>
                  <li>{t("legal.terms.deposits.item5")}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  6. {t("legal.terms.referral.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.terms.referral.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  7. {t("legal.terms.prohibited.title")}
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>{t("legal.terms.prohibited.item1")}</li>
                  <li>{t("legal.terms.prohibited.item2")}</li>
                  <li>{t("legal.terms.prohibited.item3")}</li>
                  <li>{t("legal.terms.prohibited.item4")}</li>
                  <li>{t("legal.terms.prohibited.item5")}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  8. {t("legal.terms.limitation.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.terms.limitation.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  9. {t("legal.terms.termination.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.terms.termination.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  10. {t("legal.terms.changes.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">{t("legal.terms.changes.content")}</p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  11. {t("legal.terms.contact.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.terms.contact.content")}
                  <br />
                  Email: NexaBChain@Gmail.com
                  <br />
                  Address: Wales, United Kingdom
                </p>
              </section>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-6">{t("legal.privacyPolicy")}</h2>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">{t("legal.lastUpdated")}: March 22, 2025</p>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  1. {t("legal.privacy.collection.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed mb-2">
                  {t("legal.privacy.collection.intro")}
                </p>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>{t("legal.privacy.collection.item1")}</li>
                  <li>{t("legal.privacy.collection.item2")}</li>
                  <li>{t("legal.privacy.collection.item3")}</li>
                  <li>{t("legal.privacy.collection.item4")}</li>
                  <li>{t("legal.privacy.collection.item5")}</li>
                  <li>{t("legal.privacy.collection.item6")}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  2. {t("legal.privacy.usage.title")}
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>{t("legal.privacy.usage.item1")}</li>
                  <li>{t("legal.privacy.usage.item2")}</li>
                  <li>{t("legal.privacy.usage.item3")}</li>
                  <li>{t("legal.privacy.usage.item4")}</li>
                  <li>{t("legal.privacy.usage.item5")}</li>
                  <li>{t("legal.privacy.usage.item6")}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  3. {t("legal.privacy.sharing.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.privacy.sharing.content")}
                </p>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4 mt-2">
                  <li>{t("legal.privacy.sharing.item1")}</li>
                  <li>{t("legal.privacy.sharing.item2")}</li>
                  <li>{t("legal.privacy.sharing.item3")}</li>
                  <li>{t("legal.privacy.sharing.item4")}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  4. {t("legal.privacy.security.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.privacy.security.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  5. {t("legal.privacy.cookies.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.privacy.cookies.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  6. {t("legal.privacy.rights.title")}
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>{t("legal.privacy.rights.item1")}</li>
                  <li>{t("legal.privacy.rights.item2")}</li>
                  <li>{t("legal.privacy.rights.item3")}</li>
                  <li>{t("legal.privacy.rights.item4")}</li>
                  <li>{t("legal.privacy.rights.item5")}</li>
                  <li>{t("legal.privacy.rights.item6")}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  7. {t("legal.privacy.retention.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.privacy.retention.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  8. {t("legal.privacy.transfers.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.privacy.transfers.content")}
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  9. {t("legal.privacy.children.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.privacy.children.content")}
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  10. {t("legal.privacy.contact.title")}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  {t("legal.privacy.contact.content")}
                  <br />
                  Email: NexaBChain@Gmail.com
                  <br />
                  Data Protection Officer: dpo@nexachain.com
                </p>
              </section>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
