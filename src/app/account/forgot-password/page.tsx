// src/app/account/forgot-password/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const supabase = createClient();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/account/reset-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(
        err.message || "Failed to send reset email. Please try again."
      );
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1A1A] p-8 shadow-2xl border-2 border-[#D4AF37]/20 text-center"
        >
          <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#10B981]" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-4">
            Check Your Email
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-6">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
              {email}
            </span>
          </p>
          <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-8">
            Click the link in the email to reset your password. The link will
            expire in 1 hour.
          </p>
          <a
            href="/account/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-2xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sign In
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1A1A] p-8 shadow-2xl border-2 border-[#D4AF37]/20"
      >
        <a
          href="/account/signin"
          className="inline-flex items-center gap-2 text-[#4A4A4A] dark:text-[#B8B8B8] hover:text-[#D4AF37] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Sign In
        </a>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">
            Forgot Password?
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-white dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </button>

          <p className="text-center text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
            Remember your password?{" "}
            <a
              href="/account/signin"
              className="text-[#D4AF37] hover:text-[#FFD700] font-semibold"
            >
              Sign in
            </a>
          </p>
        </div>
      </motion.form>
    </div>
  );
}