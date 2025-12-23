// src/app/admin/page.tsx - COMPLETE VERSION WITH BALANCE & ROI CONTROLS
"use client";

import { useState, useEffect, useMemo } from "react";
import useUser from "@/utils/useUser";
import LoadingScreen from "@/components/LoadingScreen";
import { Profile } from "@/types/database.types";
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Eye, 
  X, 
  Search, 
  Plus, 
  TrendingUp,
  Shield,
  Settings,
  MessageCircle,
  Bell
} from "lucide-react";
import AdminInbox from "@/components/messaging/AdminInbox";
import { motion, AnimatePresence } from "framer-motion";

interface UserWithInvestments extends Profile {
  active_investments?: any[];
}

export default function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals" | "users" | "messages" | "testdata">("deposits");
  const [users, setUsers] = useState<UserWithInvestments[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");
  const [userFilterType, setUserFilterType] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Balance Control States
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithInvestments | null>(null);
  const [balanceAction, setBalanceAction] = useState<'set' | 'adjust'>('adjust');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDescription, setBalanceDescription] = useState('');
  
  // ROI Control States
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  
  // Unified Control Message
  const [controlMessage, setControlMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState<any[]>([]); // ✅ ARRAY, not object

const formatTimeAgo = (time: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

  const pendingDeposits = useMemo(() => deposits.filter((d) => d.status === "pending"), [deposits]);
  const pendingWithdrawals = useMemo(() => withdrawals.filter((w) => w.status === "pending"), [withdrawals]);

  const filteredDeposits = useMemo(() => {
    return deposits.filter((d) => {
      const matchesSearch = d.amount.toString().includes(searchTerm) ||
        d.crypto_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deposits, searchTerm, filterStatus]);

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesSearch = w.amount.toString().includes(searchTerm) ||
        w.crypto_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || w.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [withdrawals, searchTerm, filterStatus]);

  const filteredUsers = useMemo(() => {
    return users.filter((userData) => {
      const matchesSearch = 
        userData.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        userData.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        userData.city?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        userData.country?.toLowerCase().includes(userSearchTerm.toLowerCase());

      const matchesFilter =
        userFilterType === "all" ||
        (userFilterType === "active" && userData.active_investments && userData.active_investments.length > 0) ||
        (userFilterType === "inactive" && (!userData.active_investments || userData.active_investments.length === 0)) ||
        (userFilterType === "high-balance" && parseFloat(userData.account_balance.toString()) > 10000);

      return matchesSearch && matchesFilter;
    });
  }, [users, userSearchTerm, userFilterType]);

  const totalActiveInvestments = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.active_investments?.length || 0), 0);
  }, [users]);

  const activeUsersCount = useMemo(() => {
    return users.filter(u => u.active_investments && u.active_investments.length > 0).length;
  }, [users]);

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

        updateNotifications();
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

const updateNotifications = async () => {
  try {
    const [depositsRes, withdrawalsRes, messagesRes, usersRes] = await Promise.all([
      fetch('/api/admin/deposits?status=pending'),
      fetch('/api/admin/withdrawals?status=pending'),
      fetch('/api/messages/conversations'),
      fetch('/api/admin/users')
    ]);

    const notificationsList: any[] = [];

    // Pending Deposits
    if (depositsRes.ok) {
      const depositsData = await depositsRes.json();
      const pendingDeposits = (depositsData.deposits || []).filter((d: any) => d.status === 'pending');
      
      pendingDeposits.forEach((deposit: any) => {
        notificationsList.push({
          id: `deposit-${deposit.id}`,
          type: 'deposit',
          title: 'New Deposit',
          message: `${deposit.user_email} deposited $${parseFloat(deposit.amount).toFixed(2)}`,
          time: new Date(deposit.created_at),
          data: deposit,
        });
      });
    }

    // Pending Withdrawals
    if (withdrawalsRes.ok) {
      const withdrawalsData = await withdrawalsRes.json();
      const pendingWithdrawals = (withdrawalsData.withdrawals || []).filter((w: any) => w.status === 'pending');
      
      pendingWithdrawals.forEach((withdrawal: any) => {
        notificationsList.push({
          id: `withdrawal-${withdrawal.id}`,
          type: 'withdrawal',
          title: 'Withdrawal Request',
          message: `${withdrawal.user_email} requested $${parseFloat(withdrawal.amount).toFixed(2)}`,
          time: new Date(withdrawal.created_at),
          data: withdrawal,
        });
      });
    }

    // Open Messages
    if (messagesRes.ok) {
      const messagesData = await messagesRes.json();
      const openConversations = (messagesData.conversations || []).filter((c: any) => c.status === 'open');
      
      openConversations.forEach((conversation: any) => {
        notificationsList.push({
          id: `message-${conversation.id}`,
          type: 'message',
          title: 'Unread Message',
          message: `${conversation.user_name}: ${conversation.subject || 'Support Request'}`,
          time: new Date(conversation.last_message_at || conversation.created_at),
          data: conversation,
        });
      });
    }

    // New Users (last 7 days)
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsers = (usersData.users || []).filter((u: any) => 
        new Date(u.created_at) > sevenDaysAgo
      );
      
      newUsers.forEach((user: any) => {
        notificationsList.push({
          id: `user-${user.id}`,
          type: 'user',
          title: 'New User Signup',
          message: `${user.full_name || user.email} joined the platform`,
          time: new Date(user.created_at),
          data: user,
        });
      });
    }

    // Sort by time (newest first)
    notificationsList.sort((a, b) => b.time.getTime() - a.time.getTime());

    setNotifications(notificationsList);
  } catch (error) {
    console.error('Failed to update notifications:', error);
  }
};

// Make sure your useEffect is correct:
useEffect(() => {
  if (user) {
    updateNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(updateNotifications, 30000);
    return () => clearInterval(interval);
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

      updateNotifications();
    } catch (err) {
      console.error("Error refetching data:", err);
    }
  };

  // ============================================
  // BALANCE CONTROL FUNCTIONS - START
  // ============================================
  const openBalanceModal = (userData: UserWithInvestments) => {
    setSelectedUser(userData);
    setShowBalanceModal(true);
    setBalanceAmount('');
    setBalanceDescription('');
    setControlMessage(null);
  };

  const handleSetBalance = async () => {
    if (!balanceAmount || !selectedUser) {
      setControlMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setActionLoading(true);
    setControlMessage(null);

    try {
      const endpoint = balanceAction === 'set' 
        ? '/api/admin/balance/set'
        : '/api/admin/balance/adjust';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          amount: parseFloat(balanceAmount),
          description: balanceDescription || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setControlMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          setShowBalanceModal(false);
          refetchData();
        }, 1500);
      } else {
        setControlMessage({ type: 'error', text: data.error || 'Failed to update balance' });
      }
    } catch (err) {
      console.error('Balance update error:', err);
      setControlMessage({ type: 'error', text: 'Failed to update balance' });
    } finally {
      setActionLoading(false);
    }
  };
  // ============================================
  // BALANCE CONTROL FUNCTIONS - END
  // ============================================

  // ============================================
  // ROI CONTROL FUNCTIONS - START
  // ============================================
  const openCreditModal = (investment: any, userData: UserWithInvestments) => {
    setSelectedInvestment(investment);
    setSelectedUser(userData);
    setShowCreditModal(true);
    setCreditAmount('');
    setCreditDescription('');
    setControlMessage(null);
  };

  const handleCreditROI = async () => {
    if (!creditAmount || !selectedInvestment) {
      setControlMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setActionLoading(true);
    setControlMessage(null);

    try {
      const res = await fetch('/api/admin/roi/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment_id: selectedInvestment.id,
          amount: parseFloat(creditAmount),
          description: creditDescription || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setControlMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          setShowCreditModal(false);
          refetchData();
        }, 1500);
      } else {
        setControlMessage({ type: 'error', text: data.error || 'Failed to credit ROI' });
      }
    } catch (err) {
      console.error('ROI credit error:', err);
      setControlMessage({ type: 'error', text: 'Failed to credit ROI' });
    } finally {
      setActionLoading(false);
    }
  };
  // ============================================
  // ROI CONTROL FUNCTIONS - END
  // ============================================

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

  if (userLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user || profile?.role !== "admin") {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
      {/* ============================================ */}
      {/* NAVBAR WITH NOTIFICATIONS - START */}
      {/* ============================================ */}
      <nav className="border-b border-[#D4AF37]/20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Nexachain Admin
            </span>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-all"
  >
    <Bell className="w-6 h-6 text-[#000000] dark:text-[#FFFFFF]" />
    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {notifications.length > 9 ? '9+' : notifications.length}
      </span>
    )}
  </button>

  {/* Notification Dropdown */}
  {showNotifications && (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
      <div className="p-4 border-b border-[#D4AF37]/20 sticky top-0 bg-white dark:bg-[#1A1A1A]">
        <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF]">
          Pending Actions
        </h3>
        <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
          {notifications.length} items need attention
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
            All caught up! No pending actions.
          </p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            className="p-4 border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A]">
                {notif.type === 'deposit' && <DollarSign className="w-5 h-5 text-[#10B981]" />}
                {notif.type === 'withdrawal' && <DollarSign className="w-5 h-5 text-[#3B82F6]" />}
                {notif.type === 'message' && <MessageCircle className="w-5 h-5 text-[#F59E0B]" />}
                {notif.type === 'user' && <Users className="w-5 h-5 text-[#D4AF37]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="user-card-header">
                  <h4 className="font-semibold text-[#000000] dark:text-[#FFFFFF] text-sm">
                    {notif.title}
                  </h4>
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] whitespace-nowrap ml-2">
                    {formatTimeAgo(notif.time)}
                  </span>
                </div>
                <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-3">
                  {notif.message}
                </p>
                <div className="flex gap-2">
                  {notif.type === 'deposit' && (
                    <button
                      onClick={() => {
                        setActiveTab('deposits');
                        setShowNotifications(false);
                      }}
                      className="px-3 py-1 text-xs bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all"
                    >
                      Review Deposit
                    </button>
                  )}
                  {notif.type === 'withdrawal' && (
                    <button
                      onClick={() => {
                        setActiveTab('withdrawals');
                        setShowNotifications(false);
                      }}
                      className="px-3 py-1 text-xs bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all"
                    >
                      Review Withdrawal
                    </button>
                  )}
                  {notif.type === 'message' && (
                    <button
                      onClick={() => {
                        setActiveTab('messages');
                        setShowNotifications(false);
                      }}
                      className="px-3 py-1 text-xs bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-all"
                    >
                      View Message
                    </button>
                  )}
                  {notif.type === 'user' && (
                    <button
                      onClick={() => {
                        setActiveTab('users');
                        setShowNotifications(false);
                      }}
                      className="px-3 py-1 text-xs bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8860B] transition-all"
                    >
                      View User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
      )}
       </div>

              <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Admin: {user.email}
              </span>
              <a
                href="/admin/manage-admins"
                className="flex items-center gap-2 px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
              >
                <Shield className="w-4 h-4" />
                Manage Admins
              </a>
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
      {/* ============================================ */}
      {/* NAVBAR WITH NOTIFICATIONS - END */}
      {/* ============================================ */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="admin-stats-grid mb-8">
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

        {/* Filters & Search - For Deposits/Withdrawals */}
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

        {/* Filters & Search - For Users */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
                <input
                  type="text"
                  placeholder="Search by name, email, city, or country..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <select
                value={userFilterType}
                onChange={(e) => setUserFilterType(e.target.value)}
                className="px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active Investors</option>
                <option value="inactive">Inactive Users</option>
                <option value="high-balance">High Balance ($10k+)</option>
              </select>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <div className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Showing <span className="font-bold text-[#D4AF37]">{filteredUsers.length}</span> of {users.length} users
              </div>
              <div className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                Active Investors: <span className="font-bold text-[#10B981]">{activeUsersCount}</span>
              </div>
            </div>
          </div>
        )}

       {/* Tabs */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 overflow-hidden">
          <div className="admin-tabs">
            <button  //className="admin-tab-button"
              onClick={() => setActiveTab("deposits")}
              className={`admin-tab-button font-semibold transition-all ${activeTab === "deposits" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Deposits ({pendingDeposits.length} pending)
            </button>
            <button  //className="admin-tab-button"
              onClick={() => setActiveTab("withdrawals")}
              className={`admin-tab-button font-semibold transition-all ${activeTab === "withdrawals" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Withdrawals ({pendingWithdrawals.length} pending)
            </button>
            <button  //className="admin-tab-button"
              onClick={() => setActiveTab("users")}
              className={`admin-tab-button font-semibold transition-all ${activeTab === "users" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
              Users & ROI
            </button>
            <button  //className="admin-tab-button"
            onClick={() => setActiveTab("messages")}
            className={`admin-tab-button font-semibold transition-all ${activeTab === "messages" ? "bg-[#D4AF37] text-white" : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"}`}
            >
           <span className="flex items-center justify-center gap-2">
             <MessageCircle className="w-4 h-4" />
           Messages
          </span>
            </button>
           {/* <button
              onClick={() => setActiveTab("testdata")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === "testdata" 
                  ? "bg-[#D4AF37] text-white" 
                  : "text-[#4A4A4A] dark:text-[#B8B8B8] hover:bg-[#D4AF37]/10"
              }`}
            >
              🧪 Test Data
            </button> */}
          </div>

          <div className="p-6">
            {/* DEPOSITS TAB */}
            {activeTab === "deposits" && (
             <div className="admin-table-container custom-scrollbar"> 
                {filteredDeposits.length === 0 ? (
                  <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
                    No deposits found
                  </p>
                ) : (
                    <table className="admin-table">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Crypto</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Plan</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Proof</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Actions</th>
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
                            {deposit.user_email || 'N/A'}
                          </td>
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
                            {deposit.proof_image_url ? (
                deposit.proof_image_url === "email_attached" ? (
                   <span className="text-[#10B981] text-sm font-semibold">
                   📧 Sent via Email
                     </span>
                  ) : (
                         <button
                          onClick={() => setSelectedImage(deposit.proof_image_url!)}
                     className="flex items-center gap-2 text-[#D4AF37] hover:underline"
                 >
                    <Eye className="w-4 h-4" />
                     View
                         </button>
                          )
                    )  : (
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">No proof</span>
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
                                  onClick={() => handleApproveDeposit(deposit.id)}
                                  disabled={actionLoading}
                                  className="p-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectDeposit(deposit.id)}
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

            {/* WITHDRAWALS TAB */}
            {activeTab === "withdrawals" && (
              <div className="admin-table-container custom-scrollbar">
                {filteredWithdrawals.length === 0 ? (
                  <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
                    No withdrawals found
                  </p>
                ) : (
                   <table className="admin-table">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Crypto</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Wallet Address</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4A4A4A] dark:text-[#B8B8B8]">Actions</th>
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
                            {withdrawal.user_email || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {new Date(withdrawal.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#000000] dark:text-[#FFFFFF]">
                            ${parseFloat(withdrawal.amount.toString()).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-[#000000] dark:text-[#FFFFFF]">
                            {withdrawal.crypto_type}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#000000] dark:text-[#FFFFFF]">
                            {withdrawal.wallet_address.substring(0, 10)}...{withdrawal.wallet_address.substring(withdrawal.wallet_address.length - 8)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                withdrawal.status === "approved" || withdrawal.status === "completed"
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
                                  onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                  disabled={actionLoading}
                                  className="p-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all disabled:opacity-50"
                                  title="Approve & Deduct Balance"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectWithdrawal(withdrawal.id)}
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
          </div>
            {/* ============================================ */}
            {/* USERS TAB WITH BALANCE & ROI CONTROLS - START */}
            {/* ============================================ */}
          

{activeTab === "users" && (
  <div className="space-y-6">
    <div className="bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F] p-4 rounded-lg mb-6">
      <h4 className="font-bold text-[#92400E] dark:text-[#FCD34D] mb-2">
        💡 User Management Guide
      </h4>
      <p className="text-sm text-[#92400E] dark:text-[#FCD34D]">
        • <strong>💰 Control Balance:</strong> Set or adjust user account balance directly
        <br />
        • <strong>📈 Credit ROI:</strong> Manually increase investment value + user balance
        <br />
        Credit ROI daily for best user experience. You control when users get paid returns.
      </p>
    </div>

    {filteredUsers.length === 0 ? (
      <p className="text-center py-8 text-[#4A4A4A] dark:text-[#B8B8B8]">
        No users found matching your search criteria
      </p>
    ) : (
      filteredUsers.map((userData) => (
        <div key={userData.id} className="border-2 border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all">
          {/* User Header with Avatar & Basic Info */}
          <div className="user-card-header">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-white text-2xl font-bold">
                {userData.full_name ? userData.full_name.charAt(0).toUpperCase() : userData.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                  {userData.full_name || 'No name set'}
                </h3>
                <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">{userData.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    userData.role === 'admin' 
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                      : 'bg-[#10B981]/10 text-[#10B981]'
                  }`}>
                    {userData.role.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                    Joined {new Date(userData.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#D4AF37] mb-1">
                ${parseFloat(userData.account_balance.toString()).toFixed(2)}
              </div>
              <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-3">Available Balance</div>
              {/* BALANCE CONTROL BUTTON */}
              <button
                onClick={() => openBalanceModal(userData)}
                className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                💰 Control Balance
              </button>
            </div>
          </div>

          {/* Enhanced User Details Section */}
          <div className="bg-[#F8F9FA] dark:bg-[#0A0A0A] rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-[#000000] dark:text-[#FFFFFF] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              User Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">📧 Email:</span>
                  <span className="text-sm font-mono text-[#000000] dark:text-[#FFFFFF] break-all">
                    {userData.email}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">📱 Phone:</span>
                  <span className="text-sm font-mono text-[#000000] dark:text-[#FFFFFF]">
                    {userData.phone || <span className="text-[#4A4A4A] dark:text-[#B8B8B8] italic">Not provided</span>}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">💳 Wallet:</span>
                  <span className="text-sm font-mono text-[#000000] dark:text-[#FFFFFF] break-all">
                    {userData.wallet_address ? (
                      <span title={userData.wallet_address}>
                        {userData.wallet_address.substring(0, 10)}...{userData.wallet_address.substring(userData.wallet_address.length - 8)}
                      </span>
                    ) : (
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8] italic">Not set</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">🏙️ City:</span>
                  <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                    {userData.city || <span className="text-[#4A4A4A] dark:text-[#B8B8B8] italic">Not set</span>}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">🗺️ State:</span>
                  <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                    {userData.state || <span className="text-[#4A4A4A] dark:text-[#B8B8B8] italic">Not set</span>}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">🌍 Country:</span>
                  <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                    {userData.country || <span className="text-[#4A4A4A] dark:text-[#B8B8B8] italic">Not set</span>}
                  </span>
                </div>
              </div>

              {/* Referral Information */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">🔗 Ref Code:</span>
                  <span className="text-sm font-mono text-[#D4AF37] font-semibold">
                    {userData.referral_code}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">👤 Referred By:</span>
                  <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                    {userData.referred_by || <span className="text-[#4A4A4A] dark:text-[#B8B8B8] italic">Direct signup</span>}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">💰 Ref Bonus:</span>
                  <span className="text-sm font-semibold text-[#10B981]">
                    ${parseFloat(userData.total_referral_bonus.toString()).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">📊 Invested:</span>
                  <span className="text-sm font-semibold text-[#3B82F6]">
                    ${parseFloat(userData.total_invested.toString()).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">💸 Withdrawn:</span>
                  <span className="text-sm font-semibold text-[#EF4444]">
                    ${parseFloat(userData.total_withdrawn.toString()).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] min-w-[80px]">🆔 User ID:</span>
                  <span className="text-xs font-mono text-[#4A4A4A] dark:text-[#B8B8B8]" title={userData.id}>
                    {userData.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Stats Cards */}
          <div className="user-card-details mb-4 p-4 bg-[#F8F9FA] dark:bg-[#0A0A0A] rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">
                {userData.active_investments?.length || 0}
              </div>
              <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">Active Investments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#10B981]">
                ${userData.active_investments?.reduce((sum, inv) => sum + parseFloat(inv.current_value), 0).toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">Total Portfolio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#3B82F6]">
                ${userData.active_investments?.reduce((sum, inv) => sum + parseFloat(inv.principal_amount), 0).toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">Total Invested</div>
            </div>
          </div>

          {/* Active Investments */}
          {userData.active_investments && userData.active_investments.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-[#000000] dark:text-[#FFFFFF] mb-2">Active Investments:</h4>
              {userData.active_investments.map((investment) => (
                <div key={investment.id} className="border border-[#D4AF37]/20 rounded-lg p-4 bg-white dark:bg-[#0A0A0A]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{investment.investment_plans?.emoji}</span>
                      <div>
                        <h5 className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                          {investment.investment_plans?.name}
                        </h5>
                        <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                          Started {new Date(investment.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* ROI CREDIT BUTTON */}
                    <button
                      onClick={() => openCreditModal(investment, userData)}
                      className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Credit ROI
                    </button>
                  </div>
                  <div className="user-card-details text-sm">
                    <div>
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">Principal:</span>
                      <div className="font-semibold text-[#000000] dark:text-[#FFFFFF]">
                        ${parseFloat(investment.principal_amount).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">Current Value:</span>
                      <div className="font-semibold text-[#10B981]">
                        ${parseFloat(investment.current_value).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#4A4A4A] dark:text-[#B8B8B8]">Profit:</span>
                      <div className="font-semibold text-[#D4AF37]">
                        +${(parseFloat(investment.current_value) - parseFloat(investment.principal_amount)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-[#4A4A4A] dark:text-[#B8B8B8] bg-[#F8F9FA] dark:bg-[#0A0A0A] rounded-lg">
              No active investments
            </div>
          )}
        </div>
      ))
    )}
  </div>
)}
           {activeTab === "messages" && (
              <div className="min-h-[700px]">
                <AdminInbox />
              </div>
            )}
          </div>
        
            {/* ============================================ */}
            {/* USERS TAB WITH BALANCE & ROI CONTROLS - END */}
            {/* ============================================ */}

            {/* TEST DATA TAB */}
           {/* {activeTab === "testdata" && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700]">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                      Test Data Generator
                    </h2>
                    <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                      Quickly populate test accounts with realistic data
                    </p>
                  </div>
                </div>

                <div className="bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F] rounded-lg p-4">
                  <h4 className="font-bold text-[#92400E] dark:text-[#FCD34D] mb-2">
                    💡 Quick Start
                  </h4>
                  <ol className="text-sm text-[#92400E] dark:text-[#FCD34D] space-y-1 list-decimal list-inside">
                    <li>Open browser console (F12)</li>
                    <li>Make sure you're logged in as admin</li>
                    <li>Paste this command:</li>
                  </ol>
                  <div className="mt-3 p-3 bg-[#000000] rounded-lg overflow-x-auto">
                    <code className="text-[#10B981] text-xs font-mono block whitespace-pre">
                     {`fetch('/api/admin/test-data', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({
                       email: 'testbot001@test.com',
                       scenario: 'active_investor'
                         })
                       }).then(r => r.json()).then(console.log);`}
                    </code>
                  </div>
                  <p className="text-xs text-[#92400E] dark:text-[#FCD34D] mt-3 mb-3">
                    ℹ️ <strong>Available Scenarios:</strong>
                  </p>
                  <ul className="text-xs text-[#92400E] dark:text-[#FCD34D] space-y-1 ml-4">
                    <li>• <strong>'new_user'</strong> - 1 pending deposit</li>
                    <li>• <strong>'active_investor'</strong> - 2 investments + $500 balance</li>
                    <li>• <strong>'experienced_trader'</strong> - 4 investments + withdrawals</li>
                    <li>• <strong>'vip_whale'</strong> - 3 large investments + $15k balance</li>
                  </ul>
                  <p className="text-xs text-[#92400E] dark:text-[#FCD34D] mt-3">
                    🗑️ <strong>To clear data:</strong> Replace <code className="bg-black/20 px-1 rounded">POST</code> with <code className="bg-black/20 px-1 rounded">DELETE</code> and remove the body.
                  </p>
                </div>
              </div>
               )}
              </div>
             </div>*/} 
      </div>     

      
      {/* BALANCE CONTROL MODAL - START */}
      {/* ============================================ */}
      <AnimatePresence>
        {showBalanceModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => !actionLoading && setShowBalanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#3B82F6] p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                    💰 Control User Balance
                  </h3>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
                    {selectedUser.full_name || selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => !actionLoading && setShowBalanceModal(false)}
                  disabled={actionLoading}
                  className="p-2 hover:bg-[#3B82F6]/10 rounded-lg transition-all disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-[#000000] dark:text-[#FFFFFF]" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                    Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBalanceAction('set')}
                      disabled={actionLoading}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        balanceAction === 'set' 
                          ? 'bg-[#3B82F6] text-white' 
                          : 'border-2 border-[#3B82F6]/20 text-[#000000] dark:text-[#FFFFFF] hover:bg-[#3B82F6]/10'
                      }`}
                    >
                      Set To
                    </button>
                    <button
                      onClick={() => setBalanceAction('adjust')}
                      disabled={actionLoading}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        balanceAction === 'adjust' 
                          ? 'bg-[#3B82F6] text-white' 
                          : 'border-2 border-[#3B82F6]/20 text-[#000000] dark:text-[#FFFFFF] hover:bg-[#3B82F6]/10'
                      }`}
                    >
                      Add/Subtract
                    </button>
                  </div>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-2">
                    {balanceAction === 'set' 
                      ? '• Set exact balance (e.g., 1000 = set balance to $1,000)'
                      : '• Add (+) or subtract (-) from current balance (e.g., 500 adds $500, -200 subtracts $200)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder={balanceAction === 'set' ? 'Enter new balance' : 'Enter amount (+/-)'}
                    disabled={actionLoading}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#3B82F6]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#3B82F6] focus:outline-none disabled:opacity-50"
                  />
                  <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
                    Current Balance: <span className="font-semibold text-[#3B82F6]">${parseFloat(selectedUser.account_balance.toString()).toFixed(2)}</span>
                  </p>
                  {balanceAmount && (
                    <p className="text-xs font-semibold text-[#10B981] mt-1">
                      New Balance: ${balanceAction === 'set' 
                        ? parseFloat(balanceAmount).toFixed(2)
                        : (parseFloat(selectedUser.account_balance.toString()) + parseFloat(balanceAmount)).toFixed(2)
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={balanceDescription}
                    onChange={(e) => setBalanceDescription(e.target.value)}
                    placeholder="e.g., Bonus reward, Refund, Correction"
                    disabled={actionLoading}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#3B82F6]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#3B82F6] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {controlMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  controlMessage.type === 'success' 
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800'
                }`}>
                  <p className="text-sm font-semibold">{controlMessage.text}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 border-2 border-[#3B82F6]/20 text-[#000000] dark:text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#3B82F6]/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetBalance}
                  disabled={actionLoading || !balanceAmount || parseFloat(balanceAmount) === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Update Balance'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ============================================ */}
      {/* BALANCE CONTROL MODAL - END */}
      {/* ============================================ */}

      {/* ============================================ */}
      {/* ROI CREDIT MODAL - START */}
      {/* ============================================ */}
      <AnimatePresence>
        {showCreditModal && selectedInvestment && selectedUser && (
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
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
                    📈 Credit ROI
                  </h3>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                    {selectedUser.full_name || selectedUser.email}
                  </p>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] flex items-center gap-1 mt-1">
                    <span className="text-lg">{selectedInvestment.investment_plans?.emoji}</span>
                    {selectedInvestment.investment_plans?.name}
                  </p>
                </div>
                <button
                  onClick={() => !actionLoading && setShowCreditModal(false)}
                  disabled={actionLoading}
                  className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-all disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-[#000000] dark:text-[#FFFFFF]" />
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
                    placeholder="Enter ROI amount to credit"
                    disabled={actionLoading}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none disabled:opacity-50"
                  />
                  {selectedInvestment.investment_plans?.daily_roi && (
                    <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
                      💡 Suggested Daily ROI: <span className="font-semibold text-[#D4AF37]">
                        ${(parseFloat(selectedInvestment.principal_amount) * (selectedInvestment.investment_plans.daily_roi / 100)).toFixed(2)}
                      </span>
                      <br />
                      Based on {selectedInvestment.investment_plans.daily_roi}% of ${parseFloat(selectedInvestment.principal_amount).toFixed(2)} principal
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={creditDescription}
                    onChange={(e) => setCreditDescription(e.target.value)}
                    placeholder="e.g., Daily ROI - Day 1, Weekly bonus"
                    disabled={actionLoading}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="p-4 rounded-lg bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F]">
                  <h4 className="font-semibold text-[#92400E] dark:text-[#FCD34D] mb-2 text-sm">
                    📊 Impact Preview
                  </h4>
                  <div className="space-y-1 text-xs text-[#92400E] dark:text-[#FCD34D]">
                    <p>
                      <strong>User Balance:</strong> ${parseFloat(selectedUser.account_balance.toString()).toFixed(2)} 
                      → <span className="font-bold text-[#10B981]">
                        ${(parseFloat(selectedUser.account_balance.toString()) + parseFloat(creditAmount || "0")).toFixed(2)}
                      </span>
                    </p>
                    <p>
                      <strong>Investment Value:</strong> ${parseFloat(selectedInvestment.current_value).toFixed(2)} 
                      → <span className="font-bold text-[#10B981]">
                        ${(parseFloat(selectedInvestment.current_value) + parseFloat(creditAmount || "0")).toFixed(2)}
                      </span>
                    </p>
                    <p className="pt-2 border-t border-[#92400E]/20">
                      <strong>Total Profit:</strong> +${(parseFloat(selectedInvestment.current_value) - parseFloat(selectedInvestment.principal_amount) + parseFloat(creditAmount || "0")).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {controlMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  controlMessage.type === 'success' 
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800'
                }`}>
                  <p className="text-sm font-semibold">{controlMessage.text}</p>
                </div>
              )}

              <div className="flex gap-3">
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
      {/* ============================================ */}
      {/* ROI CREDIT MODAL - END */}
      {/* ============================================ */}

      {/* ============================================ */}
      {/* IMAGE PREVIEW MODAL - START */}
      {/* ============================================ */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
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
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={selectedImage}
                alt="Proof of payment"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ============================================ */}
      {/* IMAGE PREVIEW MODAL - END */}
      {/* ============================================ */}
    
    </div>
      );
}