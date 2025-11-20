"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  Users,
  Copy,
  Check,
} from "lucide-react";

export default function DashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, investmentsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/investments"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.profile);
        }

        if (investmentsRes.ok) {
          const data = await investmentsRes.json();
          setInvestments(data.investments || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      const link = `${window.location.origin}/account/signup?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (userLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  const stats = [
    {
      label: "Account Balance",
      value: profile?.account_balance || 0,
      icon: Wallet,
      prefix: "$",
    },
    {
      label: "Total Invested",
      value: profile?.total_invested || 0,
      icon: TrendingUp,
      prefix: "$",
    },
    {
      label: "Total Withdrawn",
      value: profile?.total_withdrawn || 0,
      icon: ArrowDownCircle,
      prefix: "$",
    },
    {
      label: "Referral Bonus",
      value: profile?.total_referral_bonus || 0,
      icon: Users,
      prefix: "$",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      {/* Header */}
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Welcome, {user.name || user.email}
              </span>
              <a
                href="/account/logout"
                className="px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
                  {stat.prefix}
                  <AnimatedCounter end={stat.value} />
                </div>
                <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <a
            href="/dashboard/fund"
            className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] p-6 rounded-2xl text-white hover:shadow-2xl transition-all"
          >
            <h3 className="text-xl font-bold mb-2">Make Deposit</h3>
            <p className="text-white/90">
              Fund your account and start investing
            </p>
          </a>
          <a
            href="/dashboard/withdraw"
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
              Withdraw Funds
            </h3>
            <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
              Request a payout to your wallet
            </p>
          </a>
          <a
            href="/dashboard/referrals"
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
              Referrals
            </h3>
            <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
              Earn bonuses by referring friends
            </p>
          </a>
        </div>

        {/* Referral Link */}
        {profile?.referral_code && (
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 mb-8">
            <h3 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF] mb-4">
              Your Referral Link
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/account/signup?ref=${profile.referral_code}`}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF]"
              />
              <button
                onClick={copyReferralLink}
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Active Investments */}
        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
          <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
            Active Investments
          </h3>
          {investments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-4">
                No active investments yet
              </p>
              <a
                href="/dashboard/fund"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Make Your First Deposit
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {investments.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A] border border-[#D4AF37]/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{inv.plan_emoji}</span>
                      <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                        {inv.plan_name}
                      </span>
                    </div>
                    <span className="text-[#D4AF37] font-bold">
                      {inv.daily_roi}% Daily
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                        Principal:
                      </span>
                      <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                        ${inv.principal_amount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                        Current Value:
                      </span>
                      <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                        ${inv.current_value}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                        Expected Return:
                      </span>
                      <span className="font-semibold text-[#10B981]">
                        ${inv.expected_return}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



