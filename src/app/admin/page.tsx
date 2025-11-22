// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import { Profile, Deposit, Withdrawal } from "@/types/database.types";
import { Users, DollarSign, CheckCircle, XCircle, Eye, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, depositsRes, withdrawalsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/admin/deposits"),
          fetch("/api/admin/withdrawals"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.profile);

          if (data.profile?.role !== "admin") {
            window.location.href = "/dashboard";
            return;
          }
        }

        if (depositsRes.ok) {
          const data = await depositsRes.json();
          setDeposits(data.deposits || []);
        }

        if (withdrawalsRes.ok) {
          const data = await withdrawalsRes.json();
          setWithdrawals(data.withdrawals || []);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleApproveDeposit = async (depositId: string) => {
    if (!confirm("Are you sure you want to approve this deposit?")) return;

    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        setDeposits(
          deposits.map((d) =>
            d.id === depositId ? { ...d, status: "confirmed" as const } : d
          )
        );
        alert("Deposit approved successfully!");
      }
    } catch (err) {
      console.error("Error approving deposit:", err);
      alert("Failed to approve deposit");
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    if (!confirm("Are you sure you want to reject this deposit?")) return;

    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        setDeposits(
          deposits.map((d) =>
            d.id === depositId ? { ...d, status: "rejected" as const } : d
          )
        );
        alert("Deposit rejected");
      }
    } catch (err) {
      console.error("Error rejecting deposit:", err);
      alert("Failed to reject deposit");
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    if (!confirm("Are you sure you want to approve this withdrawal?")) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === withdrawalId ? { ...w, status: "approved" as const } : w
          )
        );
        alert("Withdrawal approved successfully!");
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      alert("Failed to approve withdrawal");
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    if (!confirm("Are you sure you want to reject this withdrawal?")) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === withdrawalId ? { ...w, status: "rejected" as const } : w
          )
        );
        alert("Withdrawal rejected");
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      alert("Failed to reject withdrawal");
    }
  };

  if (userLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user || profile?.role !== "admin") {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const confirmedDeposits = deposits.filter((d) => d.status === "confirmed");

  // Filter data based on search and status
  const filteredDeposits = deposits.filter((d) => {
    const matchesSearch = d.amount.toString().includes(searchTerm) ||
      d.crypto_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch = w.amount.toString().includes(searchTerm) ||
      w.crypto_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain Admin
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Admin: {user.email}
              </span>
              <a
                href="/dashboard"
                className="px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                Dashboard
              </a>
              <a
                href="/account/logout"
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {pendingDeposits.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Pending Deposits
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {pendingWithdrawals.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Pending Withdrawals
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {confirmedDeposits.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Confirmed Deposits
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {deposits.length + withdrawals.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Total Transactions
            </div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
              <input
                type="text"
                placeholder="Search by amount or crypto type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 overflow-hidden">
          <div className="flex border-b border-[#D4AF37]/20">
            <button
              onClick={() => setActiveTab("deposits")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${activeTab === "deposits" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Deposits ({pendingDeposits.length} pending)
            </button>
            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${activeTab === "withdrawals" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Withdrawals ({pendingWithdrawals.length} pending)
            </button>
          </div>

          <div className="p-6">
            {activeTab === "deposits" && (
              <div className="overflow-x-auto">
                {filteredDeposits.length === 0 ? (
                  <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
                    No deposits found
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Crypto
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Plan
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Proof
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeposits.map((deposit) => (
                        <motion.tr
                          key={deposit.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5"
                        >
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {new Date(deposit.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#000000] dark:text-[#FFFFFF]">
                            ${parseFloat(deposit.amount.toString()).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {deposit.crypto_type}
                          </td>
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {deposit.plan_emoji} {deposit.plan_name}
                          </td>
                          <td className="py-3 px-4">
                            {deposit.proof_image_url && (
                              <button
                                onClick={() =>
                                  setSelectedImage(deposit.proof_image_url!)
                                }
                                className="flex items-center gap-2 text-[#D4AF37] hover:underline"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                deposit.status === "confirmed"
                                  ? "bg-[#10B981]/10 text-[#10B981]"
                                  : deposit.status === "rejected"
                                    ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                                    : "bg-[#D4AF37]/10 text-[#D4AF37]"
                              }`}
                            >
                              {deposit.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {deposit.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleApproveDeposit(deposit.id)
                                  }
                                  className="p-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectDeposit(deposit.id)
                                  }
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "withdrawals" && (
              <div className="overflow-x-auto">
                {filteredWithdrawals.length === 0 ? (
                  <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
                    No withdrawals found
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Crypto
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Wallet
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map((withdrawal) => (
                        <motion.tr
                          key={withdrawal.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5"
                        >
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {new Date(
                              withdrawal.created_at,
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#000000] dark:text-[#FFFFFF]">
                            ${parseFloat(withdrawal.amount.toString()).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {withdrawal.crypto_type}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#000000] dark:text-[#FFFFFF]">
                            {withdrawal.wallet_address.substring(0, 20)}...
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                withdrawal.status === "approved" ||
                                withdrawal.status === "completed"
                                  ? "bg-[#10B981]/10 text-[#10B981]"
                                  : withdrawal.status === "rejected"
                                    ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                                    : "bg-[#D4AF37]/10 text-[#D4AF37]"
                              }`}
                            >
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {withdrawal.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleApproveWithdrawal(withdrawal.id)
                                  }
                                  className="p-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectWithdrawal(withdrawal.id)
                                  }
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={selectedImage}
                alt="Proof of payment"
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}