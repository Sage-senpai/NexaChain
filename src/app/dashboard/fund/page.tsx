"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import { ArrowLeft, Check, Upload } from "lucide-react";
import useUpload from "@/utils/useUpload";

export default function FundPage() {
  const { data: user, loading: userLoading } = useUser();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState("");
  const [cryptoType, setCryptoType] = useState("BTC");
  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { upload } = useUpload();

  const wallets = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    USDT: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
    SOL: "7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi",
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const uploadedUrl = await upload(file);
        setProofImage(uploadedUrl);
      } catch (err) {
        console.error("Error uploading file:", err);
        setError("Failed to upload proof of payment");
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
        `Amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount || "unlimited"}`,
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
          proof_image_url: proofImage,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit deposit");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
    } catch (err) {
      console.error("Error submitting deposit:", err);
      setError("Failed to submit deposit. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div className="text-center">
          <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
            Deposit Submitted!
          </h2>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-6">
            Your deposit is pending admin approval. You'll be notified once
            confirmed.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </a>
        </div>
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
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= num ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white" : "bg-[#E5E7EB] dark:bg-[#1A1A1A] text-[#4A4A4A]"}`}
              >
                {step > num ? <Check className="w-5 h-5" /> : num}
              </div>
              {num < 4 && (
                <div
                  className={`w-16 h-1 ${step > num ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700]" : "bg-[#E5E7EB] dark:bg-[#1A1A1A]"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-8">
          {/* Step 1: Choose Plan */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
                Choose Investment Plan
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
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
                  </div>
                ))}
              </div>
              <button
                onClick={() => selectedPlan && setStep(2)}
                disabled={!selectedPlan}
                className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 2 && (
            <div>
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
                  placeholder={`Min: $${selectedPlan?.min_amount} | Max: $${selectedPlan?.max_amount || "Unlimited"}`}
                  className="w-full px-4 py-4 text-2xl font-bold rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              {selectedPlan && amount && (
                <div className="p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20 mb-6">
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
                </div>
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
            </div>
          )}

          {/* Step 3: Choose Crypto & Get Wallet */}
          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
                Choose Payment Method
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.keys(wallets).map((crypto) => (
                  <div
                    key={crypto}
                    onClick={() => setCryptoType(crypto)}
                    className={`p-6 rounded-xl border-2 cursor-pointer text-center transition-all ${cryptoType === crypto ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#D4AF37]/20 hover:border-[#D4AF37]/50"}`}
                  >
                    <div className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                      {crypto}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20 mb-6">
                <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
                  Send ${amount} worth of {cryptoType} to:
                </h3>
                <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#D4AF37]/20 break-all font-mono text-sm text-[#000000] dark:text-[#FFFFFF] mb-4">
                  {wallets[cryptoType]}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wallets[cryptoType]);
                    alert("Wallet address copied!");
                  }}
                  className="w-full px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
                >
                  Copy Address
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
            </div>
          )}

          {/* Step 4: Upload Proof */}
          {step === 4 && (
            <div>
              <h2 className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
                Upload Proof of Payment
              </h2>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-6">
                Please upload a screenshot of your transaction confirmation
              </p>

              <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#D4AF37]/20 rounded-lg cursor-pointer hover:border-[#D4AF37] transition-all">
                  {proofImage ? (
                    <div className="text-center">
                      <Check className="w-12 h-12 text-[#10B981] mx-auto mb-2" />
                      <p className="text-[#10B981] font-semibold">
                        Proof Uploaded
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                        Click to upload proof
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mb-6">
                  {error}
                </div>
              )}

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



