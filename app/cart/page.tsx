"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, MessageCircle } from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price_naira: number | null;
  quantity: number;
  variants: Record<string, string>;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [authEmail, setAuthEmail] = useState<string | null>(null);

  useEffect(() => {
  supabase?.auth.getUser().then(({ data }) => {
    if (data.user) setAuthEmail(data.user.email ?? null);
  });
}, []);

  useEffect(() => {
    setMounted(true);
    setCart(JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]"));
  }, []);

  const save = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem("kaizen_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const updateQty = (id: string, delta: number) => {
    const updated = cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    save(updated);
  };

  const remove = (id: string) => save(cart.filter(i => i.id !== id));

  const clearCart = () => save([]);

  const total = cart.reduce((sum, i) => sum + (i.price_naira ?? 0) * i.quantity, 0);
  const hasAllPrices = cart.every(i => i.price_naira !== null);

  const cartSummary = cart.map(i => {
    const variants = Object.entries(i.variants).map(([k, v]) => `${k}: ${v}`).join(", ");
    return `${i.name}${variants ? ` (${variants})` : ""} x${i.quantity}`;
  }).join(", ");

  const waMessage = encodeURIComponent(
    `Hi KaizenSetup! I'd like to place an order:\n${cart.map(i => {
      const variants = Object.entries(i.variants).map(([k, v]) => `${k}: ${v}`).join(", ");
      return `• ${i.name}${variants ? ` (${variants})` : ""} x${i.quantity}`;
    }).join("\n")}\n\nPlease confirm availability and total price.`
  );

  const submitOrder = async () => {
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      setFormError("Please fill in name, email and phone.");
      return;
    }
    setFormStatus("loading");
    setFormError("");

    if (supabase) {
      const items = cart.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price_naira ?? undefined,
        variant: Object.entries(i.variants).map(([k, v]) => `${k}: ${v}`).join(", ") || undefined,
      }));

      const { error } = await supabase.from("consultation_requests").insert([{
        name: orderForm.name,
        email: authEmail ?? orderForm.email,
        phone: orderForm.phone,
        message: orderForm.note || null,
        setup_type: "Shop Order",
        status: "pending",
        items,
        total_naira: hasAllPrices ? total : null,
      }]);
      if (error) { setFormStatus("error"); setFormError("Something went wrong. Try again."); return; }
    }

    setFormStatus("success");
    clearCart();
  };

  if (!mounted) return null;

  if (cart.length === 0 && formStatus !== "success") {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
          <p className="text-gray-400 mb-6">Add some products to get started.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">
            Browse Shop
          </Link>
        </div>
      </main>
    );
  }

  if (formStatus === "success") {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">✅</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Received!</h1>
          <p className="text-gray-400 mb-6">We'll contact you shortly to confirm your order.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline mb-8">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex gap-4">
                <Link href={`/shop/${item.slug}`}>
                  <div className="w-20 h-20 bg-white dark:bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-800">
                    <img
                      src={item.image_url ?? "/images/products/placeholder.jpg"}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain p-1"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${item.slug}`}>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white hover:text-blue-500 transition-colors truncate">
                      {item.name}
                    </h3>
                  </Link>
                  {Object.entries(item.variants).length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  )}
                  {item.price_naira ? (
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      ₦{(item.price_naira * item.quantity).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Price on request</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(item.id, -1)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.id, 1)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => remove(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary + Form */}
          <div className="flex flex-col gap-4">
            {/* Summary */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="flex flex-col gap-2 mb-4">
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 truncate mr-2">{i.name} x{i.quantity}</span>
                    <span className="text-gray-900 dark:text-white font-medium flex-shrink-0">
                      {i.price_naira ? `₦${(i.price_naira * i.quantity).toLocaleString()}` : "TBD"}
                    </span>
                  </div>
                ))}
              </div>
              {hasAllPrices && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-blue-500">₦{total.toLocaleString()}</span>
                </div>
              )}
              {!hasAllPrices && (
                <p className="text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                  Some items don't have fixed prices. We'll confirm the total when we contact you.
                </p>
              )}
            </div>

            {/* Checkout Form */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Your Details</h2>
              <div className="flex flex-col gap-3">
                <input name="name" value={orderForm.name} onChange={e => setOrderForm({ ...orderForm, name: e.target.value })}
                  placeholder="Your Name"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                <input name="phone" value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })}
                  placeholder="Phone Number"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
               <input name="email" value={authEmail ?? orderForm.email} onChange={e => !authEmail && setOrderForm({ ...orderForm, email: e.target.value })}
                  placeholder="Email Address" type="email" readOnly={!!authEmail}
                  className={`px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors ${authEmail ? "opacity-60 cursor-not-allowed" : ""}`} />
                <textarea value={orderForm.note} onChange={e => setOrderForm({ ...orderForm, note: e.target.value })}
                  placeholder="Additional notes (optional)" rows={2}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                {formError && <p className="text-red-500 text-xs">{formError}</p>}
                <button onClick={submitOrder} disabled={formStatus === "loading"}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm transition-colors">
                  <ShoppingCart size={16} />
                  {formStatus === "loading" ? "Placing Order..." : "Place Order"}
                </button>
                <a href={`https://wa.me/2347035378462?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 py-3 rounded-lg font-semibold text-sm transition-colors">
                  <MessageCircle size={16} /> Checkout via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}