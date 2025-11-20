"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import { Users, DollarSign, CheckCircle, XCircle, Eye } from "lucide-react";

export default function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("deposits");
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleApproveDeposit = async (depositId) => {
    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        setDeposits(
          deposits.map((d) =>
            d.id === depositId ? { ...d, status: "confirmed" } : d,
          ),
        );
        alert("Deposit approved successfully!");
      }
    } catch (err) {
      console.error("Error approving deposit:", err);
      alert("Failed to approve deposit");
    }
  };

  const handleRejectDeposit = async (depositId) => {
    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        setDeposits(
          deposits.map((d) =>
            d.id === depositId ? { ...d, status: "rejected" } : d,
          ),
        );
        alert("Deposit rejected");
      }
    } catch (err) {
      console.error("Error rejecting deposit:", err);
      alert("Failed to reject deposit");
    }
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      const res = await fetch(
        `/api/admin/withdrawals/${withdrawalId}/approve`,
        {
          method: "POST",
        },
      );

      if (res.ok) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === withdrawalId ? { ...w, status: "approved" } : w,
          ),
        );
        alert("Withdrawal approved successfully!");
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      alert("Failed to approve withdrawal");
    }
  };

  const handleRejectWithdrawal = async (withdrawalId) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === withdrawalId ? { ...w, status: "rejected" } : w,
          ),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
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
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {pendingDeposits.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Pending Deposits
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {pendingWithdrawals.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Pending Withdrawals
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {deposits.filter((d) => d.status === "confirmed").length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Confirmed Deposits
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border-2 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
              {deposits.length + withdrawals.length}
            </div>
            <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
              Total Transactions
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 overflow-hidden">
          <div className="flex border-b border-[#D4AF37]/20">
            <button
              onClick={() => setActiveTab("deposits")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${activeTab === "deposits" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Deposits ({pendingDeposits.length})
            </button>
            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${activeTab === "withdrawals" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Withdrawals ({pendingWithdrawals.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "deposits" && (
              <div className="overflow-x-auto">
                {deposits.length === 0 ? (
                  <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
                    No deposits yet
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
                      {deposits.map((deposit) => (
                        <tr
                          key={deposit.id}
                          className="border-b border-[#D4AF37]/10"
                        >
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {new Date(deposit.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#000000] dark:text-[#FFFFFF]">
                            ${parseFloat(deposit.amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {deposit.crypto_type}
                          </td>
                          <td className="py-3 px-4">
                            {deposit.proof_image_url && (
                              <button
                                onClick={() =>
                                  setSelectedImage(deposit.proof_image_url)
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
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectDeposit(deposit.id)
                                  }
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "withdrawals" && (
              <div className="overflow-x-auto">
                {withdrawals.length === 0 ? (
                  <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
                    No withdrawals yet
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
                      {withdrawals.map((withdrawal) => (
                        <tr
                          key={withdrawal.id}
                          className="border-b border-[#D4AF37]/10"
                        >
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {new Date(
                              withdrawal.created_at,
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#000000] dark:text-[#FFFFFF]">
                            ${parseFloat(withdrawal.amount).toFixed(2)}
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
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectWithdrawal(withdrawal.id)
                                  }
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
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
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto">
            <img
              src={selectedImage}
              alt="Proof of payment"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}



