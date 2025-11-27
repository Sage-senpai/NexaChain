// FILE: src/components/admin/AdminNotifications.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X, DollarSign, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'deposit' | 'withdrawal' | 'user';
  title: string;
  message: string;
  time: Date;
  data: any;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch pending actions on mount
    fetchPendingActions();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchPendingActions, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchPendingActions = async () => {
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/admin/deposits'),
        fetch('/api/admin/withdrawals'),
      ]);

      const deposits = depositsRes.ok ? (await depositsRes.json()).deposits || [] : [];
      const withdrawals = withdrawalsRes.ok ? (await withdrawalsRes.json()).withdrawals || [] : [];

      const pendingDeposits = deposits.filter((d: any) => d.status === 'pending');
      const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending');

      const newNotifications: Notification[] = [
        ...pendingDeposits.map((d: any) => ({
          id: `deposit-${d.id}`,
          type: 'deposit' as const,
          title: 'New Deposit',
          message: `${d.user_email} deposited $${parseFloat(d.amount).toFixed(2)}`,
          time: new Date(d.created_at),
          data: d,
        })),
        ...pendingWithdrawals.map((w: any) => ({
          id: `withdrawal-${w.id}`,
          type: 'withdrawal' as const,
          title: 'Withdrawal Request',
          message: `${w.user_email} requested $${parseFloat(w.amount).toFixed(2)}`,
          time: new Date(w.created_at),
          data: w,
        })),
      ];

      // Sort by time (newest first)
      newNotifications.sort((a, b) => b.time.getTime() - a.time.getTime());

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <DollarSign className="w-5 h-5 text-[#10B981]" />;
      case 'withdrawal':
        return <DollarSign className="w-5 h-5 text-[#3B82F6]" />;
      case 'user':
        return <UserPlus className="w-5 h-5 text-[#D4AF37]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#F59E0B]" />;
    }
  };

  const formatTime = (time: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-all"
      >
        <Bell className="w-6 h-6 text-[#000000] dark:text-[#FFFFFF]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-16 w-96 bg-white dark:bg-[#1A1A1A] border-2 border-[#D4AF37]/20 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                Pending Actions
              </h3>
              <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
                {unreadCount} items need attention
              </p>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 hover:bg-[#D4AF37]/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                  All caught up! No pending actions.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A]">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-[#000000] dark:text-[#FFFFFF] text-sm">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] whitespace-nowrap ml-2">
                          {formatTime(notification.time)}
                        </span>
                      </div>
                      <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-3">
                        {notification.message}
                      </p>
                      <div className="flex gap-2">
                        {notification.type === 'deposit' && (
                          <>
                            <a
                              href={`/admin?tab=deposits&highlight=${notification.data.id}`}
                              className="px-3 py-1 text-xs bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-all"
                              onClick={() => {
                                setShowPanel(false);
                                clearNotification(notification.id);
                              }}
                            >
                              Review Deposit
                            </a>
                            {notification.data.proof_image_url && (
                              <a
                                href={notification.data.proof_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs border border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all"
                              >
                                View Proof
                              </a>
                            )}
                          </>
                        )}
                        {notification.type === 'withdrawal' && (
                          <a
                            href={`/admin?tab=withdrawals&highlight=${notification.data.id}`}
                            className="px-3 py-1 text-xs bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all"
                            onClick={() => {
                              setShowPanel(false);
                              clearNotification(notification.id);
                            }}
                          >
                            Review Withdrawal
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-[#D4AF37]/20">
              <a
                href="/admin"
                className="block text-center text-sm text-[#D4AF37] hover:text-[#FFD700] font-semibold transition-colors"
                onClick={() => setShowPanel(false)}
              >
                View All in Admin Panel
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}