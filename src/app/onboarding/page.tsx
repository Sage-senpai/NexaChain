"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingPhone = localStorage.getItem("pendingPhone");
      const pendingReferralCode = localStorage.getItem("pendingReferralCode");

      if (pendingPhone && !phone) setPhone(pendingPhone);
      if (pendingReferralCode && !referralCode)
        setReferralCode(pendingReferralCode);
    }
  }, [phone, referralCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          city,
          state,
          country,
          referredBy: referralCode || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingPhone");
        localStorage.removeItem("pendingReferralCode");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to complete onboarding. Please try again.");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">
            Welcome to Nexachain!
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1A1A1A] p-8 shadow-2xl border-2 border-[#D4AF37]/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
            Tell us a bit more about yourself
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter your state"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter your country"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue to Dashboard"}
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full py-3 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] text-lg font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
          >
            Skip for Now
          </button>
        </div>
      </form>
    </div>
  );
}



