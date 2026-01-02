// src/app/faq/page.tsx
"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ArrowLeft } from "lucide-react"

interface FAQ {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")

  const faqs: FAQ[] = [
    {
      category: "Getting Started",
      question: "How do I create an account?",
      answer:
        "Click the 'Get Started' or 'Sign Up' button, fill in your details including email, password, and personal information. You can also use a referral code if you have one.",
    },
    {
      category: "Getting Started",
      question: "What is the minimum investment amount?",
      answer:
        "The minimum investment starts at $50 for the Beginner Plan. Different plans have different minimum and maximum amounts to suit various investment levels.",
    },
    {
      category: "Getting Started",
      question: "Which cryptocurrencies do you accept?",
      answer: "We accept Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and Solana (SOL) for deposits and withdrawals.",
    },
    {
      category: "Investments",
      question: "How does the daily ROI work?",
      answer:
        "Daily ROI (Return on Investment) is calculated based on your investment plan. For example, the Beginner Plan offers 5% daily ROI, which means you earn 5% of your principal investment every day for the duration of the plan.",
    },
    {
      category: "Investments",
      question: "Can I have multiple active investments?",
      answer:
        "Yes! You can have multiple investments across different plans running simultaneously. There's no limit to the number of investments you can make.",
    },
    {
      category: "Investments",
      question: "What happens when my investment matures?",
      answer:
        "When your investment reaches its maturity date, the total returns (principal + profits) are automatically credited to your account balance, which you can then withdraw or reinvest.",
    },
    {
      category: "Investments",
      question: "Can I cancel an investment early?",
      answer:
        "Once an investment is confirmed and active, it runs for the full duration of the plan. Early cancellation is not available to ensure fair returns for all investors.",
    },
    {
      category: "Deposits & Withdrawals",
      question: "How long does it take to confirm my deposit?",
      answer:
        "Deposits are typically confirmed within 24-48 hours after our admin team verifies your payment proof. Make sure to upload clear proof of payment for faster processing.",
    },
    {
      category: "Deposits & Withdrawals",
      question: "What is the withdrawal process?",
      answer:
        "Go to the Withdraw page, enter the amount and your wallet address, then submit. Withdrawals are processed within 24-48 hours by our admin team.",
    },
    {
      category: "Deposits & Withdrawals",
      question: "Are there any withdrawal fees?",
      answer:
        "We don't charge withdrawal fees. However, blockchain network fees may apply depending on the cryptocurrency you choose.",
    },
    {
      category: "Deposits & Withdrawals",
      question: "What's the minimum withdrawal amount?",
      answer: "The minimum withdrawal amount is $10 to ensure cost-effective processing.",
    },
    {
      category: "Referrals",
      question: "How does the referral program work?",
      answer:
        "Share your unique referral link with friends. When they sign up and make their first deposit, you earn 5% of their deposit amount as a referral bonus, credited directly to your account balance.",
    },
    {
      category: "Referrals",
      question: "Is there a limit to how many people I can refer?",
      answer:
        "No! You can refer unlimited friends and family members. The more people you refer, the more bonuses you earn.",
    },
    {
      category: "Referrals",
      question: "When do I receive my referral bonus?",
      answer: "Your referral bonus is credited instantly when the admin confirms your referral's first deposit.",
    },
    {
      category: "Security",
      question: "How secure is my investment?",
      answer:
        "We use bank-level encryption, secure cryptocurrency wallets, and strict verification processes. Your personal information and funds are protected with multiple security layers.",
    },
    {
      category: "Security",
      question: "Do you store my cryptocurrency?",
      answer:
        "No, we don't store your cryptocurrency. All transactions are processed through secure blockchain networks, and your investments are managed in protected cold storage wallets.",
    },
    {
      category: "Security",
      question: "What should I do if I forget my password?",
      answer: "Use the 'Forgot Password' link on the sign-in page to reset your password via email verification.",
    },
    {
      category: "Technical",
      question: "Can I use Nexachain on mobile?",
      answer:
        "Yes! Our platform is fully responsive and works seamlessly on mobile browsers. Simply visit our website from your phone or tablet.",
    },
    {
      category: "Technical",
      question: "Which browsers are supported?",
      answer:
        "We support all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For the best experience, please use the latest version of your preferred browser.",
    },
  ]

  const categories = ["All", ...Array.from(new Set(faqs.map((faq) => faq.category)))]

  const filteredFAQs = activeCategory === "All" ? faqs : faqs.filter((faq) => faq.category === activeCategory)

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
            {t("faq.title")}
          </h1>
          <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">{t("faq.subtitle")}</p>
        </motion.div>

        {/* Category Filter */}
        <div className="faq-categories mb-12">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`faq-category-button rounded-full font-semibold transition-all ${
                activeCategory === category
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white"
                  : "bg-white dark:bg-[#1A1A1A] text-[#000000] dark:text-[#FFFFFF] border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]"
              }`}
            >
              {category === "All" ? t("faq.all") : category}
            </motion.button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <span className="text-xs font-semibold text-[#D4AF37] mb-1 block">{faq.category}</span>
                  <h3 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">{faq.question}</h3>
                </div>
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-6 h-6 text-[#D4AF37]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center p-8 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-4">{t("faq.stillHaveQuestions")}</h3>
          <p className="text-white/90 mb-6">{t("faq.supportAvailable")}</p>
          <a
            href="mailto:NexaBChain@Gmail.com"
            className="inline-block px-8 py-3 bg-white text-[#D4AF37] font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            {t("faq.contactSupport")}
          </a>
        </motion.div>
      </div>
    </div>
  )
}
