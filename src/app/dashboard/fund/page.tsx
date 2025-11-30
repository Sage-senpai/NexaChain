// src/app/dashboard/fund/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import { ArrowLeft, Check, Upload, Copy } from "lucide-react";
import { InvestmentPlan } from "@/types/database.types";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

interface WalletAddresses {
  BTC: string;
  XRP: string;
  USDT_BEP20: string;
  USDT_TRC20: string;
}

type CryptoType = keyof WalletAddresses;

export default function FundPage() {
  const { data: user, loading: userLoading } = useUser();
  const [step, setStep] = useState<number>(1);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [cryptoType, setCryptoType] = useState<CryptoType>("BTC");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const wallets: WalletAddresses = {
    BTC: "1N3BavTnSRLiDiq5yWP4SLPJyPajBsFKR3",
    XRP: "rJn2zAPdFA193sixJwuFixRkYDUtx3apQh",
    USDT_TRC20: "THUxhmgffKvb8aN8Fx5ZmSXtJNDNL8goFa",
    USDT_BEP20: "0x1aea8691637110d926adaa9e96a3cfab4a531ebc",
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans || []);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };
    fetchPlans();
  }, []);

  // Convert image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        setError("");

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File size must be less than 5MB");
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Only JPG, PNG, and WebP images are allowed");
        }

        // Convert to base64
        const base64String = await fileToBase64(file);
        
        setProofImage(base64String);
        setProofImageFile(file);
      } catch (err) {
        console.error("Error processing file:", err);
        setError(err instanceof Error ? err.message : "Failed to process proof of payment");
      } finally {
        setLoading(false);
      }
    }
  };
const handleSubmit = async () => {
  if (!selectedPlan || !amount || !proofImage) {
    setError("Please complete all fields");
    return;
  }

  const numAmount = parseFloat(amount);
  if (
    numAmount < selectedPlan.min_amount ||
    (selectedPlan.max_amount && numAmount > selectedPlan.max_amount)
  ) {
    setError(
      `Amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount || "unlimited"}`
    );
    return;
  }

  try {
    setLoading(true);
    setError("");

    const res = await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: selectedPlan.id,
        crypto_type: cryptoType,
        wallet_address: wallets[cryptoType],
        amount: numAmount,
        proof_image_base64: proofImage,
      }),
    });

    // Get response text first for better error debugging
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Response parsing error:", text);
      throw new Error(`Server returned invalid response: ${text.substring(0, 100)}`);
    }

    if (!res.ok) {
      throw new Error(data.error || `Server error: ${res.status}`);
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3000);
  } catch (err: any) {
    console.error("Error submitting deposit:", err);
    setError(err.message || "Failed to submit deposit. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(wallets[cryptoType]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  

  if (userLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
            Deposit Submitted!
          </h2>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-6">
            Your deposit has been submitted and admins have been notified via email.
            You'll be notified once it's confirmed.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/dashboard"
              className="flex items-center gap-2 text-[#000000] dark:text-[#FFFFFF] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </a>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <motion.div
                animate={{
                  scale: step >= num ? 1 : 0.9,
                  backgroundColor: step >= num ? "#D4AF37" : "#E5E7EB",
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= num ? "text-white" : "text-[#4A4A4A]"}`}
              >
                {step > num ? <Check className="w-5 h-5" /> : num}
              </motion.div>
              {num < 4 && (
                <motion.div
                  animate={{
                    backgroundColor: step > num ? "#D4AF37" : "#E5E7EB",
                  }}
                  className="w-16 h-1"
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose Plan */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
                  Choose Investment Plan
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan?.id === plan.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#D4AF37]/20 hover:border-[#D4AF37]/50"}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{plan.emoji}</span>
                        <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                          {plan.name}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                            Daily ROI:
                          </span>
                          <span className="text-[#D4AF37] font-bold">
                            {plan.daily_roi}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                            Duration:
                          </span>
                          <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                            {plan.duration_days} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                            Range:
                          </span>
                          <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                            ${plan.min_amount} - ${plan.max_amount || "∞"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => selectedPlan && setStep(2)}
                  disabled={!selectedPlan}
                  className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 2: Enter Amount */}
            {step === 2 && selectedPlan && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
                  Enter Investment Amount
                </h2>
                <div className="mb-6">
                  <label className="block text-[#4A4A4A] dark:text-[#B8B8B8] mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min: $${selectedPlan.min_amount} | Max: $${selectedPlan.max_amount || "Unlimited"}`}
                    className="w-full px-4 py-4 text-2xl font-bold rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                {amount && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20 mb-6"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                        Expected Daily Return:
                      </span>
                      <span className="font-bold text-[#10B981]">
                        $
                        {(
                          (parseFloat(amount) * selectedPlan.daily_roi) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                        Total Return After {selectedPlan.duration_days} Days:
                      </span>
                      <span className="font-bold text-[#10B981]">
                        $
                        {(
                          parseFloat(amount) *
                          (1 + selectedPlan.total_roi / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-4 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => amount && setStep(3)}
                    disabled={!amount}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Choose Crypto & Get Wallet */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
                  Choose Payment Method
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {(Object.keys(wallets) as CryptoType[]).map((crypto) => (
                    <motion.div
                      key={crypto}
                      onClick={() => setCryptoType(crypto)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-6 rounded-xl border-2 cursor-pointer text-center transition-all ${cryptoType === crypto ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#D4AF37]/20 hover:border-[#D4AF37]/50"}`}
                    >
                      <div className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                        {crypto}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-6 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20 mb-6">
                  <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                    Send ${amount} worth of {cryptoType} to:
                  </h3>
                  
                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-lg">
                      <QRCode value={wallets[cryptoType]} size={200} />
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#D4AF37]/20 break-all font-mono text-sm text-[#000000] dark:text-[#FFFFFF] mb-4">
                    {wallets[cryptoType]}
                  </div>
                  <button
                    onClick={copyWalletAddress}
                    className="w-full px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" /> Copy Address
                      </>
                    )}
                  </button>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-4 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    I've Sent the Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Upload Proof */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
                  Upload Proof of Payment
                </h2>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-6">
                  Please upload a screenshot of your transaction confirmation.
                  All admins will be notified via email with your proof.
                </p>

                <div className="mb-6">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#D4AF37]/20 rounded-lg cursor-pointer hover:border-[#D4AF37] transition-all">
                    {proofImage ? (
                      <div className="text-center">
                        <Check className="w-12 h-12 text-[#10B981] mx-auto mb-2" />
                        <p className="text-[#10B981] font-semibold">
                          Proof Uploaded
                        </p>
                        <img
                          src={proofImage}
                          alt="Proof"
                          className="mt-4 max-h-32 mx-auto rounded-lg"
                        />
                        <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">
                          {proofImageFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-[#D4AF37] mx-auto mb-2" />
                        <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Click to upload proof (Max 5MB)
                        </p>
                        <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">
                          JPG, PNG, or WebP
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mb-6">
                    {error}
                  </div>
                )}

                <div className="p-4 rounded-lg bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F] mb-6">
                  <p className="text-sm text-[#92400E] dark:text-[#FCD34D]">
                    ℹ️ <strong>Note:</strong> Your proof will be sent directly to admin emails for faster processing. No storage upload required!
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(3)}
                    disabled={loading}
                    className="flex-1 px-6 py-4 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!proofImage || loading}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Deposit"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}