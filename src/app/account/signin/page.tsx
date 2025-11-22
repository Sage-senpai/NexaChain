// src/app/account/signin/page.tsx
"use client";

import { useState, FormEvent } from "react";
import useAuth from "@/utils/useAuth";
import { motion } from "framer-motion";

interface ErrorMessages {
  [key: string]: string;
}

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { signInWithCredentials } = useAuth();

  const errorMessages: ErrorMessages = {
    OAuthSignin: "Couldn't start sign-in. Please try again or use a different method.",
    OAuthCallback: "Sign-in failed after redirecting. Please try again.",
    OAuthCreateAccount: "Couldn't create an account with this sign-in method. Try another option.",
    EmailCreateAccount: "This email can't be used to create an account. It may already exist.",
    Callback: "Something went wrong during sign-in. Please try again.",
    OAuthAccountNotLinked: "This account is linked to a different sign-in method. Try using that instead.",
    CredentialsSignin: "Incorrect email or password. Try again or reset your password.",
    AccessDenied: "You don't have permission to sign in.",
    Configuration: "Sign-in isn't working right now. Please try again later.",
    Verification: "Your sign-in link has expired. Request a new one.",
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessages[errorMessage] || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1A1A] p-8 shadow-2xl border-2 border-[#D4AF37]/20"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
            Sign in to your Nexachain account
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
              Email
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
              Password
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
            Don&apos;t have an account?{" "}
            <a
              href="/account/signup"
              className="text-[#D4AF37] hover:text-[#FFD700] font-semibold"
            >
              Sign up
            </a>
          </p>
        </div>
      </motion.form>
    </div>
  );
}