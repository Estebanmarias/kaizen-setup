"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  User, Package, LogOut, Clock, ShoppingBag,
  ChevronDown, ChevronUp, ChevronRight, Camera, Check,
  Loader2, Heart, X, ShoppingCart, Users
} from "lucide-react";
import Link from "next/link";
import ReferralTab from "@/components/ReferralTab";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  referral_code: string | null;
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
  payment_status: string;
  user_id: string | null;
};

type WishlistItem = {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    price_naira: number | null;
    in_stock: boolean;
  };
};

const STATUS_STYLE: Record<string, string> = {
  pending:                "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  fulfilled:              "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  cancelled:              "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  cancellation_requested: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};
const STATUS_DOT: Record<string, string> = {
  pending:                "bg-yellow-400",
  fulfilled:              "bg-green-400",
  cancelled:              "bg-red-400",
  cancellation_requested: "bg-orange-400",
};
const STATUS_LABEL: Record<string, string> = {
  pending:                "Pending",
  fulfilled:              "Fulfilled",
  cancelled:              "Cancelled",
  cancellation_requested: "Cancel Requested",
};

function fmtN(n: number) { return "₦" + n.toLocaleString("en-NG"); }

function OrderCard({ order, userId, onCancelled }: {
  order: Order;
  userId: string;
  onCancelled: (id: string, newStatus: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const date = new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const canCancel = order.status === "pending";

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError("");
    const res = await fetch("/api/cancel-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, userId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCancelError(data.error ?? "Failed to cancel. Try again.");
      setCancelling(false);
      return;
    }
    onCancelled(order.id, data.status);
    setConfirmOpen(false);
    setCancelling(false);
  };

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
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[order.status] ?? STATUS_DOT.pending}`} />
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{date}</p>
            {order.total_naira ? <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{fmtN(order.total_naira)}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {canCancel && (
            <button onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-400 border border-red-200 dark:border-red-800 hover:border-red-400 px-2.5 py-1.5 rounded-lg transition-colors">
              <X size={11} /> Cancel
            </button>
          )}
          {items.length > 0 && (
            <button onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-red-50 dark:bg-red-950/30 px-4 py-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Cancel this order?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {order.payment_status === "paid"
              ? "Since this order was paid, a cancellation request will be sent to us for review. Refunds take 3–5 business days."
              : "This will cancel your order immediately."}
          </p>
          {cancelError && <p className="text-xs text-red-500 mb-2">{cancelError}</p>}
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={cancelling}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
              {cancelling ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </button>
            <button onClick={() => { setConfirmOpen(false); setCancelError(""); }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Keep Order
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "wishlist" | "referrals" | "profile">("orders");
  const [userId, setUserId] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth?next=/account"); return; }
      setUserId(data.user.id);

      const [{ data: prof }, { data: ords }, { data: wl }, { count: refCount }] = await Promise.all([
        supabase!.from("profiles").select("*").eq("id", data.user.id).single(),
        supabase!.from("consultation_requests").select("*").eq("email", data.user.email).order("created_at", { ascending: false }),
        supabase!.from("wishlists").select("*, products(id, name, slug, image_url, price_naira, in_stock)").eq("user_id", data.user.id).order("created_at", { ascending: false }),
        supabase!.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_id", data.user.id).eq("status", "signed_up"),
      ]);

      setProfile(prof);
      setFullName(prof?.full_name ?? "");
      setOrders(ords ?? []);
      setWishlist(wl ?? []);
      setReferralCount(refCount ?? 0);
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
    setAvatarError(""); setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatar_url = urlData.publicUrl + `?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url }).eq("id", profile.id);
      setProfile(p => p ? { ...p, avatar_url } : p);
    } catch { setAvatarError("Upload failed. Try again."); setAvatarPreview(null); }
    setUploadingAvatar(false);
    e.target.value = "";
  };

  const sendPasswordReset = async () => {
    if (!profile?.email || !supabase) return;
    setResetLoading(true);
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResetSent(true); setResetLoading(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    if (!supabase) return;
    await supabase.from("wishlists").delete().eq("id", wishlistId);
    setWishlist(prev => prev.filter(w => w.id !== wishlistId));
  };

  const handleOrderCancelled = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
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
  const avatarUrl = avatarPreview ?? profile?.avatar_url
    ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName ?? "U")}`;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";
  const isGoogleUser = profile?.avatar_url?.includes("googleusercontent");
  const pending   = orders.filter(o => o.status === "pending").length;
  const fulfilled = orders.filter(o => o.status === "fulfilled").length;

  const inp = "w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">← Back to Home</Link>

        {/* Profile card */}
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-4 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <img src={avatarUrl} alt={displayName ?? ""} className="w-16 h-16 rounded-full object-cover bg-blue-500/10" />
            <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors shadow-md">
              {uploadingAvatar ? <Loader2 size={10} className="text-white animate-spin" /> : <Camera size={10} className="text-white" />}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{displayName}</h1>
            <p className="text-sm text-gray-400 truncate">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={11} /> Member since {memberSince}</p>
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
        <div className="flex bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-1 mb-6 gap-1">
          {([
            { key: "orders",    label: "Orders",   icon: Package },
            { key: "wishlist",  label: "Wishlist", icon: Heart },
            { key: "referrals", label: "Referrals", icon: Users },
            { key: "profile",   label: "Profile",  icon: User },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === key
                  ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <Icon size={12} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.slice(0, 3)}</span>
              {key === "wishlist" && wishlist.length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {wishlist.length}
                </span>
              )}
              {key === "referrals" && referralCount > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {referralCount}
                </span>
              )}
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
            ) : orders.map(order => (
              <OrderCard key={order.id} order={order} userId={userId} onCancelled={handleOrderCancelled} />
            ))}
          </div>
        )}

        {/* Wishlist tab */}
        {tab === "wishlist" && (
          <div>
            {wishlist.length === 0 ? (
              <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                <Heart size={36} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Your wishlist is empty</p>
                <Link href="/shop" className="text-blue-500 text-sm hover:underline mt-2 inline-block">Browse the shop →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.map(w => (
                  <div key={w.id} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                    <div className="relative">
                      <div className="h-40 bg-white dark:bg-[#111] flex items-center justify-center p-4">
                        {w.products.image_url
                          ? <img src={w.products.image_url} alt={w.products.name} className="max-h-full max-w-full object-contain" />
                          : <ShoppingCart size={32} className="text-gray-300" />}
                      </div>
                      <button onClick={() => removeFromWishlist(w.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                        <X size={13} />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{w.products.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {w.products.price_naira ? fmtN(w.products.price_naira) : "Price on request"}
                        </p>
                        {!w.products.in_stock && (
                          <span className="text-xs text-red-400 font-medium">Out of stock</span>
                        )}
                      </div>
                      <Link href={`/shop/${w.products.slug}`}
                        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold rounded-lg transition-colors">
                        <ShoppingCart size={12} /> View Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Referrals tab */}
        {tab === "referrals" && (
          <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <ReferralTab
              referralCode={profile?.referral_code ?? null}
              referralCount={referralCount}
            />
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Personal Info</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                <div className="flex gap-2">
                  <input className={inp} value={fullName} onChange={e => { setFullName(e.target.value); setNameSaved(false); }} placeholder="Enter your full name" />
                  <button onClick={saveName} disabled={savingName}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${nameSaved ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500 hover:bg-blue-600 text-white"} disabled:opacity-50`}>
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