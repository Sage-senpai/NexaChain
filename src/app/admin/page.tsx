// src/app/admin/page.tsx
// Replace the existing admin page with this enhanced version
"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import { Profile } from "@/types/database.types";
import { Users, DollarSign, CheckCircle, XCircle, Eye, X, Search, Plus, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserWithInvestments extends Profile {
  active_investments?: any[];
}

export default function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals" | "users">("deposits");
  const [users, setUsers] = useState<UserWithInvestments[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, usersRes, depositsRes, withdrawalsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/admin/users"),
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

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
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

  const refetchData = async () => {
    try {
      const [usersRes, depositsRes, withdrawalsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/deposits"),
        fetch("/api/admin/withdrawals"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
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
      console.error("Error refetching data:", err);
    }
  };

  const handleApproveDeposit = async (depositId: string) => {
    if (!confirm("Approve this deposit? User's investment will be activated.")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Deposit approved! Investment activated.");
        await refetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to approve deposit");
      }
    } catch (err) {
      console.error("Error approving deposit:", err);
      alert("Failed to approve deposit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    if (!confirm("Reject this deposit?")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Deposit rejected");
        await refetchData();
      }
    } catch (err) {
      console.error("Error rejecting deposit:", err);
      alert("Failed to reject deposit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    if (!confirm("⚠️ IMPORTANT: Approve withdrawal?\n\n✅ User's balance will be DEDUCTED immediately\n💸 You MUST send funds to their wallet after approval\n\nAre you ready to send the crypto now?")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}\n\n⚠️ REMEMBER: Send crypto to user's wallet now!`);
        await refetchData();
      } else {
        const data = await res.json();
        alert(`❌ ${data.error || "Failed to approve withdrawal"}`);
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      alert("Failed to approve withdrawal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    if (!confirm("Reject this withdrawal?")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Withdrawal rejected");
        await refetchData();
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      alert("Failed to reject withdrawal");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreditModal = (investment: any, userData: UserWithInvestments) => {
    setSelectedInvestment({ ...investment, user: userData });
    setShowCreditModal(true);
    setCreditAmount("");
    setCreditDescription("");
  };

  const handleCreditROI = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    if (!confirm(`Credit $${creditAmount} ROI to ${selectedInvestment.user.full_name || selectedInvestment.user.email}?\n\nThis will increase their account balance.`)) {
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/credit-roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedInvestment.user.id,
          investment_id: selectedInvestment.id,
          amount: parseFloat(creditAmount),
          description: creditDescription || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message}`);
        setShowCreditModal(false);
        await refetchData();
      } else {
        alert(`❌ ${data.error || "Failed to credit ROI"}`);
      }
    } catch (err) {
      console.error("Error crediting ROI:", err);
      alert("Failed to credit ROI");
    } finally {
      setActionLoading(false);
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

  const totalActiveInvestments = users.reduce((sum, u) => sum + (u.active_investments?.length || 0), 0);

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
            <DollarSign className="w-8 h-8 text-[#D4AF37] mb-4" />
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {pendingDeposits.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">Pending Deposits</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <DollarSign className="w-8 h-8 text-[#D4AF37] mb-4" />
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {pendingWithdrawals.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">Pending Withdrawals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <Users className="w-8 h-8 text-[#D4AF37] mb-4" />
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {users.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">Total Users</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all"
          >
            <TrendingUp className="w-8 h-8 text-[#D4AF37] mb-4" />
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {totalActiveInvestments}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">Active Investments</div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        {(activeTab === "deposits" || activeTab === "withdrawals") && (
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
        )}

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
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${activeTab === "users" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Users & ROI Management
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
                                  disabled={actionLoading}
                                  className="p-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectDeposit(deposit.id)
                                  }
                                  disabled={actionLoading}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
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
                                  disabled={actionLoading}
                                  className="p-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all disabled:opacity-50"
                                  title="Approve & Deduct Balance"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectWithdrawal(withdrawal.id)
                                  }
                                  disabled={actionLoading}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
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

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F] p-4 rounded-lg mb-6">
                  <h4 className="font-bold text-[#92400E] dark:text-[#FCD34D] mb-2">
                    💡 ROI Management Guide
                  </h4>
                  <p className="text-sm text-[#92400E] dark:text-[#FCD34D]">
                    Click "Credit ROI" on any active investment to manually increase user portfolio. 
                    You control when users get paid their returns. Credit daily ROI consistently for best user experience.
                  </p>
                </div>

                {users.length === 0 ? (
                  <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
                    No users found
                  </p>
                ) : (
                  users.map((userData) => (
                    <div key={userData.id} className="border-2 border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                            {userData.full_name || "No Name"}
                          </h3>
                          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">{userData.email}</p>
                          <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
                            {userData.city && userData.country ? `${userData.city}, ${userData.country}` : userData.country}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-[#D4AF37]">
                            ${parseFloat(userData.account_balance.toString()).toFixed(2)}
                          </div>
                          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">Available Balance</div>
                          <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
                            Invested: ${parseFloat(userData.total_invested.toString()).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {userData.active_investments && userData.active_investments.length > 0 ? (
                        <div className="mt-4">
                          <h4 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                            Active Investments ({userData.active_investments.length})
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {userData.active_investments.map((inv: any) => (
                              <div key={inv.id} className="bg-[#F8F9FA] dark:bg-[#0A0A0A] p-4 rounded-lg border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{inv.investment_plans?.emoji || "📈"}</span>
                                    <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                                      {inv.investment_plans?.name || "Investment"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => openCreditModal(inv, userData)}
                                    disabled={actionLoading}
                                    className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg text-sm flex items-center gap-1 transition-all disabled:opacity-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Credit ROI
                                  </button>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">Principal:</span>
                                    <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                                      ${parseFloat(inv.principal_amount).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">Current Value:</span>
                                    <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                                      ${parseFloat(inv.current_value).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">Expected Return:</span>
                                    <span className="font-semibold text-[#10B981]">
                                      ${parseFloat(inv.expected_return).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="pt-2 border-t border-[#D4AF37]/20">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">Start:</span>
                                      <span className="text-[#000000] dark:text-[#FFFFFF]">
                                        {new Date(inv.start_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">End:</span>
                                      <span className="text-[#000000] dark:text-[#FFFFFF]">
                                        {new Date(inv.end_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-[#4A4A4A] dark:text-[#B8B8B8] text-sm">
                          No active investments
                        </div>
                      )}
                    </div>
                  ))
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

      {/* Credit ROI Modal */}
      <AnimatePresence>
        {showCreditModal && selectedInvestment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => !actionLoading && setShowCreditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
                    Credit ROI
                  </h3>
                  <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                    {selectedInvestment.user.full_name || selectedInvestment.user.email}
                  </p>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                    {selectedInvestment.investment_plans?.emoji} {selectedInvestment.investment_plans?.name}
                  </p>
                </div>
                <button
                  onClick={() => !actionLoading && setShowCreditModal(false)}
                  disabled={actionLoading}
                  className="p-2 hover:bg-[#D4AF37]/10 rounded-lg disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                    ROI Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Enter ROI amount"
                    disabled={actionLoading}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none disabled:opacity-50"
                  />
                  <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
                    Example daily ROI: ${(parseFloat(selectedInvestment.principal_amount) * ((selectedInvestment.investment_plans?.daily_roi || 5) / 100)).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={creditDescription}
                    onChange={(e) => setCreditDescription(e.target.value)}
                    placeholder="e.g., Daily ROI - Day 1"
                    disabled={actionLoading}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="p-4 rounded-lg bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F]">
                  <p className="text-sm text-[#92400E] dark:text-[#FCD34D]">
                    <strong>Current Balance:</strong> ${parseFloat(selectedInvestment.user.account_balance).toFixed(2)}
                    <br />
                    <strong>New Balance:</strong> ${(parseFloat(selectedInvestment.user.account_balance) + parseFloat(creditAmount || "0")).toFixed(2)}
                    <br />
                    <strong>Investment Value:</strong> ${parseFloat(selectedInvestment.current_value).toFixed(2)} → ${(parseFloat(selectedInvestment.current_value) + parseFloat(creditAmount || "0")).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreditModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreditROI}
                  disabled={actionLoading || !creditAmount || parseFloat(creditAmount) <= 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "Credit ROI"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}