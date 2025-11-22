// ============================================
// src/app/account/logout/page.tsx
"use client";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-white dark:from-[#0A0A0A] dark:to-[#1A1A1A] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1A1A] p-8 shadow-2xl border-2 border-[#D4AF37]/20 text-center">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent mb-6">
          Sign Out
        </h1>
        <p className="text-[#4A4A4A] dark:text-[#B8B8B8] mb-8">
          Are you sure you want to sign out?
        </p>

        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-lg font-semibold rounded-lg hover:shadow-2xl transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
