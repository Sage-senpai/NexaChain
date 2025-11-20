"use client";
import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref");
      if (ref) setReferralCode(ref);
    }
  }, []);

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !fullName) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Store additional data in localStorage for onboarding
      if (phone) localStorage.setItem("pendingPhone", phone);
      if (referralCode)
        localStorage.setItem("pendingReferralCode", referralCode);

      await signUpWithCredentials({
        email,
        password,
        name: fullName,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1A1A] p-8 shadow-2xl border-2 border-[#D4AF37]/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">
            Join Nexachain
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
            Start your investment journey today
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              Full Name *
            </label>
            <input
              required
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              Email *
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              Password *
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          {referralCode && (
            <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <p className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                ✨ Referred by:{" "}
                <span className="font-bold text-[#D4AF37]">{referralCode}</span>
              </p>
            </div>
          )}

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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-[#D4AF37] hover:text-[#FFD700] font-semibold"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}



