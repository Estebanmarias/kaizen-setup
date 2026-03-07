"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  User, Package, LogOut, Clock, ShoppingBag,
  ChevronDown, ChevronUp, ChevronRight, Camera, Check, Loader2
} from "lucide-react";
import Link from "next/link";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type OrderItem = {
  name: string;
  quantity: number;
  price?: number;
  variant?: string;
};

type Order = {
  id: string;
  created_at: string;
  message: string;
  status: string;
  name: string;
  total_naira: number | null;
  items: OrderItem[] | null;
};

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  fulfilled: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};
const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-400", fulfilled: "bg-green-400", cancelled: "bg-red-400",
};

function fmtN(n: number) { return "₦" + n.toLocaleString("en-NG"); }

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const date = new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={15} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {items.length > 0 ? `${items.length} item${items.length !== 1 ? "s" : ""}` : "Order"}
            </p>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[order.status] ?? STATUS_STYLE.pending}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status] ?? STATUS_DOT.pending}`} />
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{date}</p>
            {order.total_naira ? <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{fmtN(order.total_naira)}</p> : null}
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>
      {expanded && items.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/60">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{item.name}</p>
                {item.variant && <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>}
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                {item.price ? <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{fmtN(item.price)}</p> : null}
              </div>
            </div>
          ))}
          {order.total_naira && (
            <div className="flex items-center justify-between px-5 py-3 bg-gray-100 dark:bg-black/20">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmtN(order.total_naira)}</p>
            </div>
          )}
        </div>
      )}
      {!items.length && order.message && (
        <div className="border-t border-gray-200 dark:border-gray-800 px-5 py-3">
          <p className="text-xs text-gray-400 leading-relaxed">{order.message}</p>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "profile">("orders");

  // Profile editing
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Password reset
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth?next=/account"); return; }
      const [{ data: prof }, { data: ords }] = await Promise.all([
        supabase!.from("profiles").select("*").eq("id", data.user.id).single(),
        supabase!.from("consultation_requests").select("*").eq("email", data.user.email).order("created_at", { ascending: false }),
      ]);
      setProfile(prof);
      setFullName(prof?.full_name ?? "");
      setOrders(ords ?? []);
      setLoading(false);
    });
  }, [router]);

  const signOut = async () => { await supabase?.auth.signOut(); router.push("/"); };

  const saveName = async () => {
    if (!supabase || !profile) return;
    if (!fullName.trim()) { setNameError("Name cannot be empty."); return; }
    setSavingName(true); setNameError("");
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", profile.id);
    if (error) { setNameError("Failed to save. Try again."); }
    else { setProfile(p => p ? { ...p, full_name: fullName.trim() } : p); setNameSaved(true); setTimeout(() => setNameSaved(false), 2500); }
    setSavingName(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !profile) return;
    setAvatarError("");
    setUploadingAvatar(true);

    // Preview immediately
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${profile.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatar_url = urlData.publicUrl + `?t=${Date.now()}`; // cache bust
      await supabase.from("profiles").update({ avatar_url }).eq("id", profile.id);
      setProfile(p => p ? { ...p, avatar_url } : p);
    } catch {
      setAvatarError("Upload failed. Try again.");
      setAvatarPreview(null);
    }
    setUploadingAvatar(false);
    e.target.value = "";
  };

  const sendPasswordReset = async () => {
    if (!profile?.email || !supabase) return;
    setResetLoading(true);
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResetSent(true);
    setResetLoading(false);
  };

  if (loading) return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    </main>
  );

  const displayName = profile?.full_name ?? profile?.email?.split("@")[0];
  const avatarUrl = avatarPreview
    ?? profile?.avatar_url
    ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName ?? "U")}`;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";
  const isGoogleUser = profile?.avatar_url?.includes("googleusercontent");
  const pending = orders.filter(o => o.status === "pending").length;
  const fulfilled = orders.filter(o => o.status === "fulfilled").length;

  const inp = "w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">← Back to Home</Link>

        {/* Profile card */}
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-4 flex items-center gap-5">
          {/* Avatar with upload */}
          <div className="relative flex-shrink-0">
            <img src={avatarUrl} alt={displayName ?? ""}
              className="w-16 h-16 rounded-full object-cover bg-blue-500/10" />
            <button onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors shadow-md">
              {uploadingAvatar
                ? <Loader2 size={10} className="text-white animate-spin" />
                : <Camera size={10} className="text-white" />}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{displayName}</h1>
            <p className="text-sm text-gray-400 truncate">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={11} /> Member since {memberSince}
            </p>
            {avatarError && <p className="text-xs text-red-400 mt-1">{avatarError}</p>}
          </div>
          <button onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
            <LogOut size={13} /> Sign Out
          </button>
        </div>

        {/* Order stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total Orders", value: orders.length },
              { label: "Pending", value: pending },
              { label: "Fulfilled", value: fulfilled },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-1 mb-6">
          {([
            { key: "orders", label: "My Orders", icon: Package },
            { key: "profile", label: "Profile", icon: User },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === key
                  ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                <Package size={36} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No orders yet</p>
                <Link href="/shop" className="text-blue-500 text-sm hover:underline mt-2 inline-block">Browse the shop →</Link>
              </div>
            ) : orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="space-y-4">
            {/* Editable fields */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Personal Info</p>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                <div className="flex gap-2">
                  <input className={inp} value={fullName} onChange={e => { setFullName(e.target.value); setNameSaved(false); }}
                    placeholder="Enter your full name" />
                  <button onClick={saveName} disabled={savingName}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      nameSaved
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    } disabled:opacity-50`}>
                    {savingName ? <Loader2 size={13} className="animate-spin" /> : nameSaved ? <><Check size={13} /> Saved</> : "Save"}
                  </button>
                </div>
                {nameError && <p className="text-xs text-red-400">{nameError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                <input className={`${inp} opacity-60 cursor-not-allowed`} value={profile?.email ?? ""} disabled />
                <p className="text-xs text-gray-500">Email cannot be changed.</p>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">{memberSince}</p>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Password</p>
              {isGoogleUser ? (
                <p className="text-xs text-gray-500">You signed in with Google. Password change is managed by Google.</p>
              ) : resetSent ? (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">
                  <Check size={13} className="text-green-400 flex-shrink-0" />
                  <p className="text-xs text-green-400">Reset link sent to <span className="font-medium">{profile?.email}</span>. Check your inbox.</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">We'll send a reset link to your email.</p>
                  <button onClick={sendPasswordReset} disabled={resetLoading}
                    className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50 flex-shrink-0 ml-4">
                    {resetLoading ? <Loader2 size={13} className="animate-spin" /> : <>Change <ChevronRight size={13} /></>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}