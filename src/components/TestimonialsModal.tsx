// ============================================
// src/components/TestimonialsModal.tsx
"use client";

import { X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestimonialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Testimonial {
  name: string;
  location: string;
  comment: string;
  avatar: string;
  rating: number;
}

export default function TestimonialsModal({ isOpen, onClose }: TestimonialsModalProps) {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      location: "Manchester, United Kingdom",
      comment:
        "Nexachain transformed my financial future. I've earned consistent returns for 6 months now! The platform is easy to use and the support team is always responsive.",
      avatar: "SJ",
      rating: 5,
    },
    {
      name: "Michael Chen",
      location: "Singapore",
      comment:
        "The platform is incredibly secure and transparent. Best investment decision I've made. I started with the Silver Plan and now I'm confidently investing in VIP.",
      avatar: "MC",
      rating: 5,
    },
    {
      name: "Amara Okafor",
      location: "Wales, United Kingdom",
      comment:
        "Started with the Beginner Plan and now I'm on VIP. The ROI is exactly as promised! I've referred 5 friends and earned great bonuses.",
      avatar: "AO",
      rating: 5,
    },
    {
      name: "David Martinez",
      location: "Barcelona, Spain",
      comment:
        "Professional team, great support, and reliable payouts. Highly recommended! I've been investing for 8 months and haven't had a single issue.",
      avatar: "DM",
      rating: 5,
    },
    {
      name: "Fatima Al-Rashid",
      location: "Dubai, UAE",
      comment:
        "I've referred 10+ friends. The referral bonus system is amazing! The passive income I generate helps me reach my financial goals faster.",
      avatar: "FA",
      rating: 5,
    },
    {
      name: "James Wilson",
      location: "London, United Kingdom",
      comment:
        "As someone who's tried multiple investment platforms, Nexachain stands out for its transparency and consistent returns. The daily ROI is genuine.",
      avatar: "JW",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      location: "Mumbai, India",
      comment:
        "The Long Term Investment plan has been perfect for my retirement savings. I love watching my portfolio grow steadily every day.",
      avatar: "PS",
      rating: 5,
    },
    {
      name: "Carlos Rodriguez",
      location: "Mexico City, Mexico",
      comment:
        "Fast withdrawals, excellent customer service, and real profits. What more could you ask for? I've successfully withdrawn over $15,000 so far.",
      avatar: "CR",
      rating: 5,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto border-2 border-[#D4AF37]/20 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-[#1A1A1A] pb-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                  What Our Users Say
                </h2>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">
                  Real testimonials from our satisfied investors
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-[#4A4A4A] dark:text-[#B8B8B8]" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-white font-bold flex-shrink-0">
                      {t.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                        {t.name}
                      </div>
                      <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                        {t.location}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: t.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="w-4 h-4 fill-[#FFD700] text-[#FFD700]"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[#4A4A4A] dark:text-[#B8B8B8] text-sm leading-relaxed">
                    "{t.comment}"
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}