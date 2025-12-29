"use client";

import { useState } from "react";
import {
  ArrowRight, TrendingUp, Shield, Users, DollarSign, Award,
  ChevronDown, ChevronUp, Mail, Phone, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import LiveCryptoFeed from "@/components/LiveCryptoFeed";
import MobileNav from "@/components/MobileNav";
import TestimonialsModal from "@/components/TestimonialsModal";


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
  const [showCryptoFeed, setShowCryptoFeed] = useState(true);

  const plans: InvestmentPlan[] = [
    { name: "Beginner Plan", emoji: "🔰", dailyROI: 5, totalROI: 5, duration: 1, minAmount: 50, maxAmount: 499, referralBonus: 5 },
    { name: "Silver Plan", emoji: "🪙", dailyROI: 10, totalROI: 10, duration: 1, minAmount: 500, maxAmount: 999, referralBonus: 5 },
    { name: "Gold Plan", emoji: "🏆", dailyROI: 20, totalROI: 20, duration: 2, minAmount: 1000, maxAmount: 4999, referralBonus: 5 },
    { name: "VIP Membership", emoji: "💎", dailyROI: 35, totalROI: 35, duration: 4, minAmount: 5000, maxAmount: null, referralBonus: 5 },
    { name: "Long Term Investment", emoji: "📈", dailyROI: 3, totalROI: 90, duration: 30, minAmount: 155, maxAmount: 5555, referralBonus: 5 },
  ];

  const stats = [
    { label: "Active Users", value: 5076, icon: Users },
    { label: "Total Investments", value: 10000000, icon: TrendingUp, prefix: "$" },
    { label: "Countries", value: 48, icon: Award, suffix: "+" },
    { label: "ROI Paid Out", value: 2500000, icon: DollarSign, prefix: "$" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
            <nav className="hidden md:flex items-center gap-6 bg-white dark:bg-[#0A0A0A]">
              <button onClick={() => scrollToSection("plans")} className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors">Plans</button>
              <button onClick={() => scrollToSection("about")} className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors">About</button>
              <button onClick={() => scrollToSection("services")} className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors">Services</button>
              <button onClick={() => scrollToSection("contact")} className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors">Contact</button>
              <a href="/account/signin" className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors">Sign In</a>
              <a href="/account/signup" className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all">Get Started</a>
            </nav>
            <div className="md:hidden">
              <MobileNav
                links={[
                  { label: "Plans", onClick: () => scrollToSection("plans") },
                  { label: "About", onClick: () => scrollToSection("about") },
                  { label: "Services", onClick: () => scrollToSection("services") },
                  { label: "Contact", onClick: () => scrollToSection("contact") },
                  { label: "Sign In", href: "/account/signin" },
                ]}
                ctaText="Get Started"
                ctaHref="/account/signup"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#F8F9FA] dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="inline-block mb-6 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full">
            <span className="text-[#D4AF37] font-semibold text-sm">SAFE INVESTMENT • GET LIFETIME INCOME</span>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/account/signup" className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all inline-flex items-center justify-center">
              Open Deposit <ArrowRight className="ml-2" />
            </a>
            <button onClick={() => scrollToSection("plans")} className="px-8 py-4 border-2 border-[#D4AF37] text-[#000000] dark:text-[#FFFFFF] text-lg font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all">
              View Investment Plans
            </button>
          </motion.div>
        </div>
      </section>

      {/* Crypto Feed */}
      <div className="border-y border-[#D4AF37]/20 bg-[#1A1A1A] dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
          <button onClick={() => setShowCryptoFeed(!showCryptoFeed)} className="w-full py-3 flex items-center justify-between text-[#D4AF37] hover:text-[#FFD700] transition-colors">
            <span className="text-sm font-semibold">📊 Live Market Ticker</span>
            {showCryptoFeed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {showCryptoFeed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
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
              const Icon = stat.icon;
              return (
                <motion.button key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05 }} onClick={() => setShowTestimonials(true)} className="p-6 rounded-xl bg-[#F8F9FA] dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all cursor-pointer text-center">
                  <Icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                  <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
                    {stat.prefix}<AnimatedCounter end={stat.value} />{stat.suffix}
                  </div>
                  <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{stat.label}</div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-20 bg-[#F8F9FA] dark:bg-[#1A1A1A] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">Investment Proposals</h2>
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
            {plans.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-2xl transition-all">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">{p.name}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Daily ROI:</span><span className="text-[#D4AF37] font-bold">{p.dailyROI}%</span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Total ROI:</span><span className="text-[#10B981] font-bold">{p.totalROI}%</span>
                  </div>
                  <div className="flex justify-between text-[#4A4A4A] dark:text-[#B8B8B8]">
                    <span>Duration:</span><span>{p.duration} {p.duration === 1 ? "day" : "days"}</span>
                  </div>
                  <div className="pt-3 border-t border-[#D4AF37]/20 text-center">
                    <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">${p.minAmount.toLocaleString()}</span>
                    <span className="mx-2 text-[#D4AF37]">—</span>
                    {p.maxAmount ? <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">${p.maxAmount.toLocaleString()}</span> : <span className="font-bold text-[#D4AF37]">Unlimited</span>}
                  </div>
                </div>
                <a href="/account/signup" className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-xl transition-all flex items-center justify-center group">
                  Invest Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Contact */}
      <section id="contact" className="py-20 bg-white dark:bg-[#0A0A0A] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">Get In Touch</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20">
              <Mail className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Email</h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">support@nexachain.com</p>
            </div>
            <div className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20">
              <Phone className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Phone</h3>
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">UK: +44 7878345807<br/>SA: +27 78 720 8949</p>
            </div>
            <div className="text-center p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#D4AF37]/20">
              <MapPin className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">Location</h3>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">United Kingdom</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] dark:bg-[#0A0A0A] border-t border-[#D4AF37]/20 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4">Nexachain</h3>
              <p className="text-[#B8B8B8]">Your trusted investment platform</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["plans", "about", "services", "contact"].map(s => (
                  <li key={s}><button onClick={() => scrollToSection(s)} className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors capitalize">{s}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/legal" className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors">Terms of Service</a></li>
                <li><a href="/legal" className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/faq" className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors">FAQ</a></li>
                <li><button onClick={() => scrollToSection("contact")} className="text-[#B8B8B8] hover:text-[#D4AF37] transition-colors">Help Center</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#D4AF37]/20 text-center text-[#B8B8B8]">
            <p>&copy; 2025 Nexachain. All rights reserved.</p>
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
          <svg
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
          <svg
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
