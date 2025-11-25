// src/app/admin/manage-admins/page.tsx
"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import { Shield, UserPlus, UserMinus, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Admin {
  user_id: string;
  email: string;
  full_name: string;
  profile_role: string;
  jwt_role: string;
  status: string;
  created_at: string;
}

export default function ManageAdminsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/manage-admins/list");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdmins();
    }
  }, [user]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      setMessage({ type: "error", text: "Please enter an email address" });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/manage-admins/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setNewAdminEmail("");
        await fetchAdmins();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add admin" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to add admin" });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Remove admin role from ${email}?`)) return;

    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/manage-admins/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        await fetchAdmins();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to remove admin" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to remove admin" });
    } finally {
      setProcessing(false);
    }
  };

  const handleSyncRoles = async () => {
    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/manage-admins/sync", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        await fetchAdmins();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to sync roles" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to sync roles" });
    } finally {
      setProcessing(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Admin Management
            </span>
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                Back to Admin
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                Manage Administrators
              </h1>
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Add or remove admin access for team members
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border-2 flex items-center gap-3 ${
              message.type === "success"
                ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981]"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Add Admin Form */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-6">
            Add New Administrator
          </h2>
          <form onSubmit={handleAddAdmin} className="flex gap-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Enter user email address"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
              disabled={processing}
            />
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-5 h-5" />
              {processing ? "Adding..." : "Add Admin"}
            </button>
          </form>
          <p className="mt-4 text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
            💡 The user must have a registered account before you can grant them admin access.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF]">
            Current Administrators ({admins.length})
          </h2>
          <button
            onClick={handleSyncRoles}
            disabled={processing}
            className="px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? "animate-spin" : ""}`} />
            Sync Roles
          </button>
        </div>

        {/* Admins List */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 overflow-hidden">
          {admins.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                No administrators found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A]">
                    <th className="text-left py-4 px-6 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      Name
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      Added
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, index) => (
                    <motion.tr
                      key={admin.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5"
                    >
                      <td className="py-4 px-6 text-[#000000] dark:text-[#FFFFFF] font-medium">
                        {admin.email}
                      </td>
                      <td className="py-4 px-6 text-[#000000] dark:text-[#FFFFFF]">
                        {admin.full_name || "N/A"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                            admin.status.includes("Active")
                              ? "bg-[#10B981]/10 text-[#10B981]"
                              : "bg-[#F59E0B]/10 text-[#F59E0B]"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#4A4A4A] dark:text-[#B8B8B8]">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleRemoveAdmin(admin.email)}
                          disabled={processing || admin.email === user.email}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title={admin.email === user.email ? "Cannot remove yourself" : "Remove admin access"}
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F]">
          <h3 className="font-bold text-[#92400E] dark:text-[#FCD34D] mb-2">
            ⚠️ Important Information
          </h3>
          <ul className="text-sm text-[#92400E] dark:text-[#FCD34D] space-y-1">
            <li>• Admins have full access to all platform features and user data</li>
            <li>• Users must sign out and sign back in for admin role changes to take effect</li>
            <li>• You cannot remove your own admin access</li>
            <li>• Use "Sync Roles" if status shows mismatches between profile and JWT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}