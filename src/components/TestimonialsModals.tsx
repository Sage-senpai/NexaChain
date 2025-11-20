"use client";
import { X } from "lucide-react";

export default function TestimonialsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Lagos, Nigeria",
      comment:
        "Nexachain transformed my financial future. I've earned consistent returns for 6 months now!",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      location: "Singapore",
      comment:
        "The platform is incredibly secure and transparent. Best investment decision I've made.",
      avatar: "MC",
    },
    {
      name: "Amara Okafor",
      location: "Abuja, Nigeria",
      comment:
        "Started with the Beginner Plan and now I'm on VIP. The ROI is exactly as promised!",
      avatar: "AO",
    },
    {
      name: "David Martinez",
      location: "Spain",
      comment:
        "Professional team, great support, and reliable payouts. Highly recommended!",
      avatar: "DM",
    },
    {
      name: "Fatima Al-Rashid",
      location: "Dubai, UAE",
      comment:
        "I've referred 10+ friends. The referral bonus system is amazing!",
      avatar: "FA",
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1A1A1A] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-[#D4AF37]/20 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#D4AF37]">
            What Our Users Say
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#4A4A4A] dark:text-[#B8B8B8]" />
          </button>
        </div>
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-white font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                    {t.name}
                  </div>
                  <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                    {t.location}
                  </div>
                </div>
              </div>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                "{t.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



