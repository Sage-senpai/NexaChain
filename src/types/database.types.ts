// src/types/database.types.ts

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  wallet_address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  account_balance: number;
  total_invested: number;
  total_withdrawn: number;
  total_referral_bonus: number;
  referral_code: string;
  referred_by: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  emoji: string;
  daily_roi: number;
  total_roi: number;
  duration_days: number;
  min_amount: number;
  max_amount: number | null;
  referral_bonus_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  crypto_type: 'BTC' | 'ETH' | 'USDT' | 'SOL';
  wallet_address: string;
  proof_image_url: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  plan_name?: string;
  plan_emoji?: string;
}

export interface ActiveInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  deposit_id: string;
  principal_amount: number;
  current_value: number;
  expected_return: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  plan_name?: string;
  plan_emoji?: string;
  daily_roi?: number;
  duration_days?: number;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  crypto_type: 'BTC' | 'ETH' | 'USDT' | 'SOL';
  wallet_address: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'roi' | 'referral_bonus';
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProfileResponse {
  profile: Profile | null;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface PlansResponse {
  plans: InvestmentPlan[];
}

export interface DepositsResponse {
  deposits: Deposit[];
}

export interface InvestmentsResponse {
  investments: ActiveInvestment[];
}

export interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
}

export interface ReferralsResponse {
  referrals: Referral[];
}

// Form Types
export interface SignUpFormData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  referralCode?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface OnboardingFormData {
  phone?: string;
  city?: string;
  state?: string;
  country: string;
  referredBy?: string;
}

export interface DepositFormData {
  planId: string;
  amount: number;
  cryptoType: 'BTC' | 'ETH' | 'USDT' | 'SOL';
  walletAddress: string;
  proofImageUrl?: string;
}

export interface WithdrawalFormData {
  amount: number;
  cryptoType: 'BTC' | 'ETH' | 'USDT' | 'SOL';
  walletAddress: string;
}

// Component Props Types
export interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export interface TestimonialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Testimonial {
  name: string;
  location: string;
  comment: string;
  avatar: string;
  rating?: number;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  onClick?: () => void;
}