"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";

const inp = "w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the recovery token as a hash fragment
  // onAuthStateChange picks it up and sets the session automatically
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => router.push("/account"), 2500);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center font-bold text-xl tracking-tight text-gray-900 dark:text-white mb-8">
          Kaizen<span className="text-gray-500">Setup</span>
        </Link>

        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check size={22} className="text-green-400" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Password updated</p>
              <p className="text-sm text-gray-400">Redirecting you to your account...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={22} className="text-yellow-400" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Invalid or expired link</p>
              <p className="text-sm text-gray-400 mb-6">This reset link has expired or already been used.</p>
              <Link href="/account"
                className="text-sm text-blue-500 hover:underline">
                Request a new reset link from your account →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Set new password</h1>
              <p className="text-sm text-gray-400 mb-6">Choose a strong password for your account.</p>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="New password"
                    className={`${inp} pr-10`}
                  />
                  <button onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className={`${inp} pr-10`}
                    onKeyDown={e => e.key === "Enter" && handleReset()}
                  />
                  <button onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength hint */}
                {password.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= i * 4
                            ? i === 1 ? "bg-red-400" : i === 2 ? "bg-yellow-400" : "bg-green-400"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <button onClick={handleReset} disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">← Back to KaizenSetup</Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}