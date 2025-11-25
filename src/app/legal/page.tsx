// src/app/legal/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, FileText, Eye } from "lucide-react";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

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
              <span>Back to Home</span>
            </a>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4">
            Legal Information
          </h1>
          <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">
            Our commitment to transparency and your rights
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
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
              Terms of Service
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
              Privacy Policy
            </div>
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-8"
        >
          {activeTab === "terms" ? (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-6">Terms of Service</h2>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">
                Last Updated: November 22, 2025
              </p>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  1. Acceptance of Terms
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  By accessing and using Nexachain's platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  2. Eligibility
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed mb-2">
                  To use Nexachain, you must:
                </p>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be restricted from using our services under applicable laws</li>
                  <li>Provide accurate and complete registration information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  3. Investment Risks
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  Cryptocurrency investments carry inherent risks. Past performance does not guarantee future results. You should only invest amounts you can afford to lose. Nexachain provides investment opportunities but does not guarantee profits.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  4. Account Security
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized access. We are not liable for losses resulting from unauthorized account use.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  5. Deposits and Withdrawals
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>All deposits must be made using supported cryptocurrencies</li>
                  <li>Deposits are confirmed within 24-48 hours after verification</li>
                  <li>Withdrawals are processed within 24-48 hours</li>
                  <li>Minimum withdrawal amount is $10</li>
                  <li>Blockchain network fees may apply</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  6. Referral Program
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  Our referral program rewards users for referring new members. Referral bonuses are paid when referred users make their first deposit. Abuse of the referral system may result in account suspension.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  7. Prohibited Activities
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>Money laundering or financing illegal activities</li>
                  <li>Creating multiple accounts to abuse bonuses</li>
                  <li>Using automated systems or bots</li>
                  <li>Attempting to hack or disrupt our platform</li>
                  <li>Providing false or misleading information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  8. Limitation of Liability
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  Nexachain is not liable for any direct, indirect, incidental, or consequential damages arising from your use of our platform. This includes, but is not limited to, loss of profits, data, or cryptocurrency.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  9. Termination
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for violation of these terms or suspected fraudulent activity. Upon termination, you may withdraw your remaining balance subject to our verification process.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  10. Changes to Terms
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  We may update these terms at any time. Continued use of our platform after changes constitutes acceptance of the new terms. Material changes will be communicated via email or platform notification.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  11. Contact Information
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  For questions about these terms, contact us at:
                  <br />
                  Email: NexaBChain@Gmail.com
                  <br />
                  Address: Wales, United Kingdom
                </p>
              </section>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-6">Privacy Policy</h2>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">
                Last Updated: March 22, 2025
              </p>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  1. Information We Collect
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed mb-2">
                  We collect the following information:
                </p>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>Personal information (name, email, phone number)</li>
                  <li>Location information (city, state, country)</li>
                  <li>Cryptocurrency wallet addresses</li>
                  <li>Transaction history and investment data</li>
                  <li>Device and browser information</li>
                  <li>IP addresses and usage data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  2. How We Use Your Information
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>To provide and improve our investment services</li>
                  <li>To process deposits and withdrawals</li>
                  <li>To verify your identity and prevent fraud</li>
                  <li>To communicate about your account and investments</li>
                  <li>To comply with legal obligations</li>
                  <li>To send promotional emails (with your consent)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  3. Information Sharing
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  We do not sell your personal information. We may share information with:
                </p>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4 mt-2">
                  <li>Service providers who assist in platform operations</li>
                  <li>Legal authorities when required by law</li>
                  <li>Professional advisors (lawyers, accountants)</li>
                  <li>Business partners with your explicit consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  4. Data Security
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no system is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  5. Cookies and Tracking
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  We use cookies and similar technologies to improve user experience, analyze platform usage, and remember your preferences. You can control cookie settings in your browser.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  6. Your Rights
                </h3>
                <ul className="list-disc list-inside text-[#4A4A4A] dark:text-[#B8B8B8] space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to data processing</li>
                  <li>Export your data</li>
                  <li>Withdraw consent for marketing communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  7. Data Retention
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide services. Transaction records are kept for at least 7 years to comply with financial regulations.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  8. International Transfers
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  Your information may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place to protect your data during international transfers.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  9. Children's Privacy
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  Our platform is not intended for individuals under 18 years old. We do not knowingly collect information from children. If we discover we have collected such information, we will delete it immediately.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  10. Contact Us
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] leading-relaxed">
                  For privacy-related inquiries:
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
  );
}