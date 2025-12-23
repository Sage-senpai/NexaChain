// FILE: src/components/MobileNav.tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface MobileNavProps {
  links: NavLink[];
  ctaText?: string;
  ctaHref?: string;
}

export default function MobileNav({ links, ctaText, ctaHref }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#000000] dark:text-[#FFFFFF]" />
        ) : (
          <Menu className="w-6 h-6 text-[#000000] dark:text-[#FFFFFF]" />
        )}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-[#0A0A0A] border-l-2 border-[#D4AF37]/20 shadow-2xl z-50 md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20">
                <span className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                  Nexachain
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-[#000000] dark:text-[#FFFFFF]" />
                </button>
              </div>

              {/* Links */}
              <div className="p-4 space-y- bg-white dark:bg-[#0A0A0A]">
                {links.map((link, index) => (
                  link.href ? (
                    <a
                      key={index}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-[#000000] dark:text-[#FFFFFF] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      key={index}
                      onClick={() => {
                        link.onClick?.();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[#000000] dark:text-[#FFFFFF] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                    >
                      {link.label}
                    </button>
                  )
                ))}

                {/* CTA Button */}
                {ctaText && ctaHref && (
                  <a
                    href={ctaHref}
                    onClick={() => setIsOpen(false)}
                    className="block mt-4 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-center font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    {ctaText}
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}