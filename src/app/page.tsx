"use client";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  DollarSign,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import TestimonialsModal from "@/components/TestimonialsModal";

export default function LandingPage() {
  const [cryptoPrices, setCryptoPrices] = useState({
    BTC: 0,
    ETH: 0,
    SOL: 0,
    USDT: 1.0,
  });

  useEffect(() => {
    // Simulated crypto prices (in production, you'd fetch real data)
    setCryptoPrices({
      BTC: 45230.5,
      ETH: 2850.75,
      SOL: 125.3,
      USDT: 1.0,
    });
  }, []);

  const plans = [
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
  ];

  const stats = [
    { label: "Active Users", value: "50,000+", icon: Users },
    { label: "Total Investments", value: "$10M+", icon: TrendingUp },
    { label: "Countries", value: "120+", icon: Award },
    { label: "ROI Paid Out", value: "$2.5M+", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Navbar */}
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                Nexachain
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/plans"
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                Plans
              </a>
              <a
                href="/about"
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                About
              </a>
              <a
                href="/contact"
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                Contact
              </a>
              <a
                href="/account/signin"
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F8F9FA] dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent"
          >
            Climb to Your Financial Summit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#4A4A4A] dark:text-[#B8B8B8] mb-12 max-w-3xl mx-auto"
          >
            Secure cryptocurrency investments with daily returns. Join thousands
            of investors building wealth together.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/account/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl transition-all inline-flex items-center justify-center"
            >
              Start Investing <ArrowRight className="ml-2" />
            </a>
            <a
              href="/plans"
              className="px-8 py-4 border-2 border-[#D4AF37] text-[#000000] dark:text-[#FFFFFF] text-lg font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
            >
              View Plans
            </a>
          </motion.div>
        </div>
      </section>

      {/* Live Crypto Ticker */}
      <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around overflow-x-auto">
            {Object.entries(cryptoPrices).map(([symbol, price]) => (
              <div key={symbol} className="flex items-center space-x-2 px-4">
                <span className="text-[#D4AF37] font-bold">{symbol}</span>
                <span className="text-white">${price.toLocaleString()}</span>
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl bg-[#F8F9FA] dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
                >
                  <Icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                  <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-20 bg-[#F8F9FA] dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
              Investment Plans
            </h2>
            <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">
              Choose a plan that fits your investment goals
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-2xl transition-all"
              >
                <div className="text-5xl mb-4">{plan.emoji}</div>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  {plan.name}
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Daily ROI:</span>
                    <span className="text-[#D4AF37] font-bold">
                      {plan.dailyROI}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Total ROI:</span>
                    <span className="text-[#D4AF37] font-bold">
                      {plan.totalROI}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Duration:</span>
                    <span className="font-semibold">
                      {plan.duration} {plan.duration === 1 ? "day" : "days"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Min Amount:</span>
                    <span className="font-semibold">${plan.minAmount}</span>
                  </div>
                  {plan.maxAmount && (
                    <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                      <span>Max Amount:</span>
                      <span className="font-semibold">${plan.maxAmount}</span>
                    </div>
                  )}
                </div>
                <a
                  href="/account/signup"
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center"
                >
                  Invest Now <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
              Why Choose Nexachain?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                Secure
              </h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Bank-level security with multi-layer encryption to protect your
                investments
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                Transparent
              </h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Real-time tracking of all your investments and returns
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                Profitable
              </h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Consistent daily returns with flexible investment options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] dark:bg-[#0A0A0A] border-t border-[#D4AF37]/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4">
                Nexachain
              </h3>
              <p className="text-[#B8B8B8]">
                Your trusted cryptocurrency investment platform
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/plans"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Investment Plans
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/legal"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/legal"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/faq"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#D4AF37]/20 text-center text-[#B8B8B8]">
            <p>&copy; 2025 Nexachain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}



