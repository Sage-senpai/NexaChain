// src/components/shared/Navbar.tsx
"use client";

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileNav from '@/components/MobileNav';
import { ArrowLeft, Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  variant?: 'landing' | 'dashboard' | 'admin' | 'auth';
  userName?: string;
  isAdmin?: boolean;
}

export default function Navbar({ variant = 'landing', userName, isAdmin }: NavbarProps) {
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Landing Page Navbar
  if (variant === 'landing') {
    return (
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => scrollToSection("plans")} 
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t('nav.plans')}
                </button>
                <button 
                  onClick={() => scrollToSection("about")} 
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t('nav.about')}
                </button>
                <button 
                  onClick={() => scrollToSection("services")} 
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t('nav.services')}
                </button>
                <button 
                  onClick={() => scrollToSection("contact")} 
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t('nav.contact')}
                </button>
                <a 
                  href="/account/signin" 
                  className="text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
                >
                  {t('nav.signin')}
                </a>
                <a 
                  href="/account/signup" 
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {t('nav.signup')}
                </a>
              </nav>
              <LanguageSwitcher />
              <div className="md:hidden">
                <MobileNav
                  links={[
                    { label: t('nav.plans'), onClick: () => scrollToSection("plans") },
                    { label: t('nav.about'), onClick: () => scrollToSection("about") },
                    { label: t('nav.services'), onClick: () => scrollToSection("services") },
                    { label: t('nav.contact'), onClick: () => scrollToSection("contact") },
                    { label: t('nav.signin'), href: "/account/signin" },
                  ]}
                  ctaText={t('nav.signup')}
                  ctaHref="/account/signup"
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Dashboard Navbar
  if (variant === 'dashboard') {
    return (
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
            <div className="flex items-center gap-4">
              <span className="text-responsive-sm text-[#4A4A4A] dark:text-[#B8B8B8] hide-mobile">
                {t('dashboard.welcome')}, {userName}
              </span>
              <LanguageSwitcher />
              {isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Shield className="w-4 h-4" />
                  {t('nav.admin')}
                </a>
              )}
              <a
                href="/account/logout"
                className="flex items-center gap-2 px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Admin Navbar
  if (variant === 'admin') {
    return (
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain Admin
            </span>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <a
                href="/dashboard"
                className="px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                {t('nav.backToDashboard')}
              </a>
              <a
                href="/account/logout"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Auth Page Navbar (Simple)
  if (variant === 'auth') {
    return (
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/"
              className="flex items-center gap-2 text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('common.backToHome')}</span>
            </a>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    );
  }

  return null;
}