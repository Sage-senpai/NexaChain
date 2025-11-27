// FILE: src/components/admin/AdminBalanceControl.tsx
"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, X, Check, AlertCircle } from 'lucide-react';

interface AdminBalanceControlProps {
  user: any;
  investment?: any;
  onSuccess?: () => void;
}

export default function AdminBalanceControl({ user, investment, onSuccess }: AdminBalanceControlProps) {
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showROIModal, setShowROIModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Balance Control State
  const [balanceAction, setBalanceAction] = useState<'set' | 'adjust'>('adjust');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDescription, setBalanceDescription] = useState('');

  // ROI Control State
  const [roiValue, setRoiValue] = useState('');

  const handleSetBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    const amount = parseFloat(balanceAmount);
    const action = balanceAction === 'set' ? 'set to' : (amount > 0 ? 'increase by' : 'decrease by');
    const displayAmount = Math.abs(amount);

    if (!confirm(`${action.toUpperCase()} $${displayAmount.toFixed(2)} for ${user.full_name || user.email}?\n\nCurrent Balance: $${parseFloat(user.account_balance).toFixed(2)}\nNew Balance: $${balanceAction === 'set' ? amount.toFixed(2) : (parseFloat(user.account_balance) + amount).toFixed(2)}`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const endpoint = balanceAction === 'set' 
        ? '/api/admin/balance/set'
        : '/api/admin/balance/adjust';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount: amount,
          description: balanceDescription || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setBalanceAmount('');
        setBalanceDescription('');
        setTimeout(() => {
          setShowBalanceModal(false);
          onSuccess?.();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update balance' });
      }
    } catch (err) {
      console.error('Balance update error:', err);
      setMessage({ type: 'error', text: 'Failed to update balance' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetROI = async () => {
    if (!roiValue || parseFloat(roiValue) < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid value' });
      return;
    }

    const newValue = parseFloat(roiValue);
    const oldValue = parseFloat(investment.current_value);
    const profit = newValue - parseFloat(investment.principal_amount);

    if (!confirm(`Set investment value to $${newValue.toFixed(2)}?\n\nCurrent Value: $${oldValue.toFixed(2)}\nNew Value: $${newValue.toFixed(2)}\nProfit: $${profit.toFixed(2)}`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/roi/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment_id: investment.id,
          new_value: newValue,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setRoiValue('');
        setTimeout(() => {
          setShowROIModal(false);
          onSuccess?.();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update ROI' });
      }
    } catch (err) {
      console.error('ROI update error:', err);
      setMessage({ type: 'error', text: 'Failed to update ROI' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex gap-2">
        {user && (
          <button
            onClick={() => setShowBalanceModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Set Balance
          </button>
        )}
        
        {investment && (
          <button
            onClick={() => setShowROIModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Set ROI
          </button>
        )}
      </div>

      {/* Balance Control Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#3B82F6] p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
                  Control User Balance
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                  {user.full_name || user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setMessage(null);
                }}
                disabled={loading}
                className="p-2 hover:bg-[#3B82F6]/10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBalanceAction('set')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      balanceAction === 'set'
                        ? 'bg-[#3B82F6] text-white'
                        : 'border-2 border-[#3B82F6]/20 text-[#000000] dark:text-[#FFFFFF]'
                    }`}
                  >
                    Set To
                  </button>
                  <button
                    onClick={() => setBalanceAction('adjust')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      balanceAction === 'adjust'
                        ? 'bg-[#3B82F6] text-white'
                        : 'border-2 border-[#3B82F6]/20 text-[#000000] dark:text-[#FFFFFF]'
                    }`}
                  >
                    Add/Subtract
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                  Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder={balanceAction === 'set' ? 'Enter new balance' : 'Enter amount (use - for subtract)'}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#3B82F6]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#3B82F6] focus:outline-none disabled:opacity-50"
                />
                <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
                  Current balance: ${parseFloat(user.account_balance).toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={balanceDescription}
                  onChange={(e) => setBalanceDescription(e.target.value)}
                  placeholder="e.g., Bonus reward, Correction, etc."
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#3B82F6]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#3B82F6] focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Preview */}
              {balanceAmount && (
                <div className="p-4 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30">
                  <p className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                    <strong>Preview:</strong>
                    <br />
                    Current: ${parseFloat(user.account_balance).toFixed(2)}
                    <br />
                    New: ${balanceAction === 'set' 
                      ? parseFloat(balanceAmount).toFixed(2)
                      : (parseFloat(user.account_balance) + parseFloat(balanceAmount)).toFixed(2)
                    }
                  </p>
                </div>
              )}
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg border-2 flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}>
                {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setMessage(null);
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-[#3B82F6]/20 text-[#000000] dark:text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#3B82F6]/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSetBalance}
                disabled={loading || !balanceAmount}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Update Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROI Control Modal */}
      {showROIModal && investment && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#10B981] p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
                  Set Investment Value
                </h3>
                <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">
                  {investment.investment_plans?.emoji} {investment.investment_plans?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowROIModal(false);
                  setMessage(null);
                }}
                disabled={loading}
                className="p-2 hover:bg-[#10B981]/10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Current Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8F9FA] dark:bg-[#0A0A0A] rounded-lg">
                <div>
                  <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">Principal</div>
                  <div className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">
                    ${parseFloat(investment.principal_amount).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">Current Value</div>
                  <div className="text-lg font-bold text-[#10B981]">
                    ${parseFloat(investment.current_value).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* New Value Input */}
              <div>
                <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
                  New Investment Value (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={roiValue}
                  onChange={(e) => setRoiValue(e.target.value)}
                  placeholder="Enter new investment value"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#10B981]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#10B981] focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Preview */}
              {roiValue && (
                <div className="p-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30">
                  <p className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                    <strong>Preview:</strong>
                    <br />
                    New Value: ${parseFloat(roiValue).toFixed(2)}
                    <br />
                    Profit: ${(parseFloat(roiValue) - parseFloat(investment.principal_amount)).toFixed(2)}
                    <br />
                    ROI: {(((parseFloat(roiValue) - parseFloat(investment.principal_amount)) / parseFloat(investment.principal_amount)) * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg border-2 flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}>
                {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowROIModal(false);
                  setMessage(null);
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-[#10B981]/20 text-[#000000] dark:text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#10B981]/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSetROI}
                disabled={loading || !roiValue}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Update ROI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}