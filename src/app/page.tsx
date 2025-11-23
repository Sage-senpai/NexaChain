// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  DollarSign,
  Award,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import TestimonialsModal from "@/components/TestimonialsModal";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface InvestmentPlan {
  name: string;
  emoji: string;
  dailyROI: number;
  totalROI: number;
  duration: number;
  minAmount: number;
  maxAmount: number | null;
  referralBonus: number;
}

export default function LandingPage() {
  const [showTestimonials, setShowTestimonials] = useState(false);
  
  // 30+ crypto assets with simulated real-time prices
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    { symbol: "BTC", name: "Bitcoin", price: 45230.5, change: 2.4 },
    { symbol: "ETH", name: "Ethereum", price: 2850.75, change: 3.1 },
    { symbol: "USDT", name: "Tether", price: 1.0, change: 0.01 },
    { symbol: "BNB", name: "Binance Coin", price: 312.45, change: 1.8 },
    { symbol: "SOL", name: "Solana", price: 125.3, change: 5.2 },
    { symbol: "XRP", name: "Ripple", price: 0.62, change: -0.8 },
    { symbol: "ADA", name: "Cardano", price: 0.58, change: 1.2 },
    { symbol: "DOGE", name: "Dogecoin", price: 0.08, change: 4.5 },
    { symbol: "AVAX", name: "Avalanche", price: 42.15, change: 2.9 },
    { symbol: "MATIC", name: "Polygon", price: 0.89, change: 3.4 },
    { symbol: "DOT", name: "Polkadot", price: 7.23, change: -1.2 },
    { symbol: "LINK", name: "Chainlink", price: 16.78, change: 2.1 },
    { symbol: "UNI", name: "Uniswap", price: 6.45, change: 1.9 },
    { symbol: "LTC", name: "Litecoin", price: 98.32, change: 0.7 },
    { symbol: "ATOM", name: "Cosmos", price: 11.24, change: 3.6 },
    { symbol: "ETC", name: "Ethereum Classic", price: 26.89, change: -0.5 },
    { symbol: "XLM", name: "Stellar", price: 0.13, change: 2.3 },
    { symbol: "ALGO", name: "Algorand", price: 0.21, change: 4.1 },
    { symbol: "VET", name: "VeChain", price: 0.03, change: 1.5 },
    { symbol: "FIL", name: "Filecoin", price: 5.67, change: -2.1 },
    { symbol: "HBAR", name: "Hedera", price: 0.08, change: 3.8 },
    { symbol: "APT", name: "Aptos", price: 12.45, change: 5.7 },
    { symbol: "ARB", name: "Arbitrum", price: 1.89, change: 2.6 },
    { symbol: "OP", name: "Optimism", price: 2.34, change: 3.2 },
    { symbol: "INJ", name: "Injective", price: 34.56, change: 6.1 },
    { symbol: "SUI", name: "Sui", price: 1.45, change: 4.3 },
    { symbol: "TIA", name: "Celestia", price: 8.92, change: 7.2 },
    { symbol: "SEI", name: "Sei", price: 0.67, change: 5.4 },
    { symbol: "RUNE", name: "THORChain", price: 6.78, change: 2.8 },
    { symbol: "FTM", name: "Fantom", price: 0.52, change: 3.9 },
  ]);

  const plans: InvestmentPlan[] = [
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
    { label: "Active Users", value: 50000, icon: Users },
    { label: "Total Investments", value: 10000000, icon: TrendingUp, prefix: "$" },
    { label: "Countries", value: 120, icon: Award, suffix: "+" },
    { label: "ROI Paid Out", value: 2500000, icon: DollarSign, prefix: "$" },
  ];

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoPrices((prev) =>
        prev.map((crypto) => ({
          ...crypto,
          price: crypto.price * (1 + (Math.random() - 0.5) * 0.002),
          change: (Math.random() - 0.5) * 10,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
              <button
                onClick={() => scrollToSection("plans")}
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                Plans
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                Contact
              </button>
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
            <button
              onClick={() => scrollToSection("plans")}
              className="px-8 py-4 border-2 border-[#D4AF37] text-[#000000] dark:text-[#FFFFFF] text-lg font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
            >
              View Plans
            </button>
          </motion.div>
        </div>
      </section>

      {/* Live Crypto Ticker - Auto-scrolling */}
      <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#D4AF37]/20 overflow-hidden">
        <div className="relative">
          <div className="flex animate-scroll whitespace-nowrap">
            {[...cryptoPrices, ...cryptoPrices].map((crypto, index) => (
              <div
                key={`${crypto.symbol}-${index}`}
                className="inline-flex items-center space-x-2 px-6 py-2"
              >
                <span className="text-[#D4AF37] font-bold">{crypto.symbol}</span>
                <span className="text-white font-mono">
                  ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-sm ${crypto.change >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}
                >
                  {crypto.change >= 0 ? "+" : ""}
                  {crypto.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>

      {/* Stats Section - Clickable Cards */}
      <section className="py-20 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.button
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowTestimonials(true)}
                  className="text-center p-6 rounded-xl bg-[#F8F9FA] dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all cursor-pointer"
                >
                  <Icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                  <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                    {stat.prefix}
                    <AnimatedCounter end={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                    {stat.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investment Plans Section */}
      <section id="plans" className="py-20 bg-[#F8F9FA] dark:bg-[#1A1A1A] scroll-mt-16">
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

      {/* About/Features Section */}
      <section id="about" className="py-20 bg-white dark:bg-[#0A0A0A] scroll-mt-16">
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#F8F9FA] dark:bg-[#1A1A1A] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">
              Have questions? We're here to help 24/7
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border-2 border-[#D4AF37]/20">
              <Mail className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Email</h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                support@nexachain.com
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border-2 border-[#D4AF37]/20">
              <Phone className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Phone</h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                +44 7853383650
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border-2 border-[#D4AF37]/20">
              <MapPin className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Location</h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
               United Kingdom
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
                  <button
                    onClick={() => scrollToSection("plans")}
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Investment Plans
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Contact
                  </button>
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
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Help Center
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#D4AF37]/20 text-center text-[#B8B8B8]">
            <p>&copy; 2025 Nexachain. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Testimonials Modal */}
      <TestimonialsModal
        isOpen={showTestimonials}
        onClose={() => setShowTestimonials(false)}
      />
    </div>
  );
}