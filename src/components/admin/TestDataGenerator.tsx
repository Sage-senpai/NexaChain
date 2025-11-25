"use client"

import React, { useState } from 'react';
import { Database, Trash2, UserCheck, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function TestDataGenerator() {
  const [email, setEmail] = useState('testbot001@test.com');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const scenarios = [
    {
      id: 'new_user',
      name: 'New User',
      icon: UserCheck,
      description: '1 pending deposit - simulates brand new user',
      details: '• 1 pending deposit ($100-500)\n• No active investments\n• $0 balance',
      color: 'from-[#3B82F6] to-[#2563EB]'
    },
    {
      id: 'active_investor',
      name: 'Active Investor',
      icon: Users,
      description: '2 active investments + balance',
      details: '• 2 confirmed deposits\n• 2 active investments\n• $500 balance\n• 1 ROI transaction',
      color: 'from-[#10B981] to-[#059669]'
    },
    {
      id: 'experienced_trader',
      name: 'Experienced Trader',
      icon: TrendingUp,
      description: 'Multiple investments + withdrawal history',
      details: '• 4 active investments\n• 2 completed withdrawals\n• 1 pending withdrawal\n• $2,500+ balance\n• Multiple ROI transactions',
      color: 'from-[#D4AF37] to-[#FFD700]'
    },
    {
      id: 'vip_whale',
      name: 'VIP Whale',
      icon: DollarSign,
      description: 'Large investments + high balance',
      details: '• 3 VIP-tier investments\n• $15,000+ balance\n• 8+ high-value ROI transactions\n• Premium portfolio',
      color: 'from-[#8B5CF6] to-[#7C3AED]'
    }
  ];

  const handleGenerateData = async (scenario: string) => {
    if (!email) {
      setMessage('Please enter an email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, scenario }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success! Created:\n• ${data.data.deposits} deposits\n• ${data.data.investments} investments\n• ${data.data.withdrawals} withdrawals\n• ${data.data.transactions} transactions\n• $${data.data.balanceAdded.toFixed(2)} added to balance`);
        setMessageType('success');
      } else {
        setMessage(`❌ Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Failed to create test data: ${error}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      setMessageType('error');
      return;
    }

    if (!confirm(`⚠️ Clear ALL data for ${email}?\n\nThis will delete:\n• All deposits\n• All investments\n• All withdrawals\n• All transactions\n• Reset balance to $0\n\nThis action cannot be undone!`)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/test-data?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setMessageType('success');
      } else {
        setMessage(`❌ Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Failed to clear data: ${error}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700]">
          <Database className="w-6 h-6 text-white" />
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

      {/* Email Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#000000] dark:text-[#FFFFFF] mb-2">
          User Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="testbot001@test.com"
          className="w-full px-4 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
        />
        <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] mt-1">
          Enter the email of the user account you want to populate with test data
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <div
              key={scenario.id}
              className="border-2 border-[#D4AF37]/20 rounded-xl p-5 hover:border-[#D4AF37]/50 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${scenario.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF] mb-1">
                    {scenario.name}
                  </h3>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-2">
                    {scenario.description}
                  </p>
                </div>
              </div>
              
              <div className="bg-[#F8F9FA] dark:bg-[#0A0A0A] rounded-lg p-3 mb-3">
                <pre className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] whitespace-pre-line font-mono">
                  {scenario.details}
                </pre>
              </div>

              <button
                onClick={() => handleGenerateData(scenario.id)}
                disabled={loading}
                className={`w-full px-4 py-2 bg-gradient-to-r ${scenario.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Creating...' : `Generate ${scenario.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Clear Data Button */}
      <div className="border-t-2 border-[#D4AF37]/20 pt-6">
        <button
          onClick={handleClearData}
          disabled={loading}
          className="w-full px-6 py-3 border-2 border-[#EF4444]/50 text-[#EF4444] font-semibold rounded-lg hover:bg-[#EF4444]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          {loading ? 'Clearing...' : 'Clear All Test Data'}
        </button>
        <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] text-center mt-2">
          ⚠️ This will permanently delete all deposits, investments, withdrawals, and transactions
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-6 p-4 rounded-lg border-2 ${
          messageType === 'success' 
            ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' 
            : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
        }`}>
          <pre className="text-sm whitespace-pre-line">
            {message}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F] rounded-lg p-4">
        <h4 className="font-bold text-[#92400E] dark:text-[#FCD34D] mb-2">
          💡 How to Use
        </h4>
        <ul className="text-sm text-[#92400E] dark:text-[#FCD34D] space-y-1">
          <li>1. Enter the test account email (e.g., testbot001@test.com)</li>
          <li>2. Choose a scenario based on what you want to test</li>
          <li>3. Click the generate button to create realistic test data</li>
          <li>4. Login as that user to see the populated dashboard</li>
          <li>5. Use "Clear All Test Data" to reset and try different scenarios</li>
        </ul>
      </div>
    </div>
  );
}