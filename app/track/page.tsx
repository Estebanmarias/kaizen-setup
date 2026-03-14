"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Package, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  total_naira: number | null;
  payment_status: string | null;
  items: { name: string; quantity: number; variant?: string }[] | null;
  setup_type: string;
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string; description: string }> = {
  pending: {
    label: "Order Received",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-50 border-yellow-200",
    description: "Your order has been received and is being processed. We'll contact you shortly.",
  },
  fulfilled: {
    label: "Fulfilled",
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50 border-green-200",
    description: "Your order has been fulfilled and is on its way to you.",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    description: "This order has been cancelled. Contact us on WhatsApp if you have questions.",
  },
  cancellation_requested: {
    label: "Cancellation Requested",
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-200",
    description: "Your cancellation request is being reviewed. We'll notify you once processed.",
  },
};

const STEPS = ["Order Placed", "Confirmed", "Processing", "On the Way", "Delivered"];

function getStepIndex(status: string, paymentStatus: string | null) {
  if (status === "cancelled" || status === "cancellation_requested") return -1;
  if (status === "fulfilled") return 4;
  if (status === "pending" && paymentStatus === "paid") return 2;
  return 1;
}

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const trackOrder = useCallback(async (oid: string, em: string) => {
    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    const { data, error: dbError } = await supabase!
      .from("consultation_requests")
      .select("id, name, email, status, created_at, total_naira, payment_status, items, setup_type")
      .eq("id", oid.trim())
      .eq("email", em.trim().toLowerCase())
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError("No order found with that ID and email combination. Please check your details and try again.");
      return;
    }
    setOrder(data);
  }, []);

  // Auto-search from URL params
  useEffect(() => {
    const preOrderId = searchParams.get("order");
    const preEmail = searchParams.get("email");
    if (preOrderId && preEmail) {
      setOrderId(preOrderId);
      setEmail(preEmail);
      trackOrder(preOrderId, preEmail);
    }
  }, [searchParams, trackOrder]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both your Order ID and email address.");
      return;
    }
    await trackOrder(orderId, email);
  };

  const statusConfig = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending) : null;
  const stepIndex = order ? getStepIndex(order.status, order.payment_status) : -1;
  const isCancelled = order?.status === "cancelled" || order?.status === "cancellation_requested";

  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <Package size={24} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500 text-sm">Enter your Order ID and email address to check your order status.</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Order ID</label>
            <input
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. 3f2a1b4c-..."
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Find your Order ID in your confirmation email or order success message.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="The email you used to place the order"
              className={inputClass}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm transition-colors">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {/* Order result */}
        {order && statusConfig && (
          <div className="flex flex-col gap-4">

            {/* Status card */}
            <div className={`border rounded-2xl p-6 ${statusConfig.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <statusConfig.icon size={20} className={statusConfig.color} />
                <p className={`font-bold text-lg ${statusConfig.color}`}>{statusConfig.label}</p>
              </div>
              <p className="text-sm text-gray-600">{statusConfig.description}</p>
            </div>

            {/* Progress tracker */}
            {!isCancelled && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-900 mb-6">Order Progress</p>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                  <div className="absolute top-4 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
                    style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }} />
                  {STEPS.map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        i <= stepIndex
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {i < stepIndex ? <CheckCircle size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <p className={`text-[10px] font-medium text-center max-w-[56px] leading-tight ${
                        i <= stepIndex ? "text-blue-500" : "text-gray-400"
                      }`}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <p className="text-sm font-semibold text-gray-900 mb-4">Order Details</p>
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="text-gray-900 font-mono text-xs">{order.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Placed</span>
                  <span className="text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {order.total_naira && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="text-gray-900 font-semibold">₦{order.total_naira.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className={order.payment_status === "paid" ? "text-green-500 font-medium" : "text-yellow-500 font-medium"}>
                    {order.payment_status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</p>
                  <div className="flex flex-col gap-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.name} {item.variant ? `(${item.variant})` : ""} × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Need help with your order?</p>
              <a href="https://wa.me/2347035378462" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:underline">
                Chat with us on WhatsApp →
              </a>
            </div>
          </div>
        )}

        {/* No result state */}
        {searched && !loading && !order && !error && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm">No order found. Double-check your Order ID and email.</p>
          </div>
        )}

        {/* Link to account */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Have an account?{" "}
            <Link href="/account" className="text-blue-500 hover:underline">View all your orders →</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main className="min-h-screen bg-white pt-24 pb-20 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </main>
      }>
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </>
  );
}