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
                onClick={() => scrollToSection("services")}
                className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
              >
                Services
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
                className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all"
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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block mb-4 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full"
          >
            <span className="text-[#D4AF37] font-semibold text-sm">
              SAFE INVESTMENT • GET LIFETIME INCOME
            </span>
          </motion.div>
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
            className="text-xl md:text-2xl text-[#4A4A4A] dark:text-[#B8B8B8] mb-8 max-w-3xl mx-auto"
          >
            The leading financial establishment providing high-quality international investment services. Join thousands of investors earning daily returns through our automated trading systems.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#6B7280] dark:text-[#B8B8B8] mb-12 max-w-2xl mx-auto"
          >
            We are always ready to partner with you by offering full financial support with stable and automated investment strategies.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/account/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all inline-flex items-center justify-center"
            >
              Open Deposit <ArrowRight className="ml-2" />
            </a>
            <button
              onClick={() => scrollToSection("plans")}
              className="px-8 py-4 border-2 border-[#D4AF37] text-[#000000] dark:text-[#FFFFFF] text-lg font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
            >
              View Investment Plans
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
              Investment Proposals
            </h2>
            <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">
              Nexachain employees ensure that every investor can earn money with our automated systems
            </p>
            <div className="mt-6 inline-block px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                <span className="font-bold text-[#D4AF37]">No account opening fees</span> • 
                <span className="ml-2 font-bold text-[#D4AF37]">No deposit commissions</span>
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#D4AF37]/20 transition-all"
              >
                <div className="text-5xl mb-4">{plan.emoji}</div>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  {plan.name}
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Daily ROI:</span>
                    <span className="text-[#D4AF37] font-bold text-xl">
                      {plan.dailyROI}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Total ROI:</span>
                    <span className="text-[#10B981] font-bold text-xl">
                      {plan.totalROI}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Duration:</span>
                    <span className="font-semibold">
                      {plan.duration} {plan.duration === 1 ? "day" : "days"}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#D4AF37]/20">
                    <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8] mb-2">
                      <span>Investment Range:</span>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                        ${plan.minAmount.toLocaleString()}
                      </span>
                      {plan.maxAmount && (
                        <>
                          <span className="mx-2 text-[#D4AF37]">—</span>
                          <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                            ${plan.maxAmount.toLocaleString()}
                          </span>
                        </>
                      )}
                      {!plan.maxAmount && (
                        <>
                          <span className="mx-2 text-[#D4AF37]">—</span>
                          <span className="font-bold text-[#D4AF37]">Unlimited</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8] pt-2">
                    <span>Referral Bonus:</span>
                    <span className="text-[#D4AF37] font-semibold">
                      {plan.referralBonus}%
                    </span>
                  </div>
                </div>
                <a
                  href="/account/signup"
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all flex items-center justify-center group"
                >
                  Invest Now 
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
            <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8] max-w-3xl mx-auto">
              Our team of experts does everything for you with automated trading systems
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                Unique Trading Bot
              </h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Our team of professionals has created a unique trading bot that trades with efficiency and escapes market dip, ensuring capitals return safely with accurate investment returns
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                Stable & Automated
              </h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                The robot is not human-related, making all investments reliable and completely safe. Its efficiency increases daily achieving 99.9% trade accuracy
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                Expert Team 24/7
              </h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                The highly professional Nexachain team controls all trading robot processes around the clock. After investing, observe your capital growth in real-time
              </p>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                Get Started in 4 Simple Steps
              </h3>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: "Create Account", desc: "Sign up and verify your email address" },
                { step: 2, title: "Verify Email", desc: "Confirm your email to activate your account" },
                { step: 3, title: "Log In", desc: "Access your secure dashboard" },
                { step: 4, title: "Activate Plan", desc: "Choose a plan and start earning" }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="py-20 bg-[#F8F9FA] dark:bg-[#1A1A1A] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
              Our Investment Services
            </h2>
            <p className="text-xl text-[#4A4A4A] dark:text-[#B8B8B8]">
              Diversified portfolio across multiple high-yield sectors
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: "₿", 
                title: "Cryptocurrency Trading", 
                desc: "Advanced automated trading in Bitcoin, Ethereum, and 30+ digital assets with real-time market analysis" 
              },
              { 
                icon: "📊", 
                title: "Forex Trading", 
                desc: "Professional currency trading with high-frequency algorithms across major and exotic pairs" 
              },
              { 
                icon: "🏢", 
                title: "Real Estate Investment", 
                desc: "Strategic property investments in premium locations with guaranteed rental yields" 
              },
              { 
                icon: "🛢️", 
                title: "Oil & Gas Investment", 
                desc: "Energy sector investments in established wells and exploration projects worldwide" 
              },
              { 
                icon: "📈", 
                title: "Stocks & Shares", 
                desc: "Blue-chip and growth stock portfolios managed by experienced financial analysts" 
              },
              { 
                icon: "🌾", 
                title: "Agriculture & Textiles", 
                desc: "Sustainable commodity investments in agriculture and textile manufacturing" 
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white dark:bg-[#0A0A0A] scroll-mt-16">
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
            <div className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20">
              <Mail className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Email</h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                support@nexachain.com
              </p>
            </div>
            <div className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20">
              <Phone className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Phone</h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                +44 7853383650
              </p>
            </div>
            <div className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20">
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
                    onClick={() => scrollToSection("services")}
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Services
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
                  
                    <a href="/legal"
                    className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  
                   <a href="/legal"
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
                  
                   <a href="/faq"
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