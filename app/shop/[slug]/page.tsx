"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MessageCircle, ShoppingCart, ArrowLeft, Plus, Minus, Check } from "lucide-react";
import Link from "next/link";

type Variant = { name: string; options: string[]; prices?: number[] };

type Product = {
  id: string;
  name: string;
  description: string;
  price_naira: number | null;
  category: string;
  partner: string | null;
  in_stock: boolean;
  image_url: string | null;
  images: string[] | null;
  slug: string;
  variants: Variant[] | null;
};

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price_naira: number | null;
  quantity: number;
  variants: Record<string, string>;
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!supabase || !slug) return;
    supabase.from("products").select("*").eq("slug", slug).single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [slug]);

  const images = product
    ? (product.images && product.images.length > 0 ? product.images : product.image_url ? [product.image_url] : ["/images/products/placeholder.jpg"])
    : [];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });

  const variantSummary = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ");

  // Compute effective price — check if any variant has per-option pricing
  const effectivePrice = (() => {
    if (!product?.variants) return product?.price_naira ?? null;
    for (const variant of product.variants) {
      if (variant.prices && selectedVariants[variant.name]) {
        const idx = variant.options.indexOf(selectedVariants[variant.name]);
        if (idx >= 0) return variant.prices[idx];
      }
    }
    return product?.price_naira ?? null;
  })();

  const hasVariantPricing = product?.variants?.some(v => v.prices && v.prices.length > 0);
  const minVariantPrice = (() => {
    if (!product?.variants) return null;
    for (const variant of product.variants) {
      if (variant.prices && variant.prices.length > 0) return Math.min(...variant.prices);
    }
    return null;
  })();

  const addToCart = () => {
    if (!product) return;
    const cart: CartItem[] = JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]");
    const key = `${product.id}-${variantSummary}`;
    const existing = cart.findIndex(i => i.id === key);
    if (existing >= 0) {
      cart[existing].quantity += quantity;
    } else {
      cart.push({
        id: key,
        name: product.name,
        slug: product.slug,
        image_url: images[0] ?? null,
        price_naira: effectivePrice,
        quantity,
        variants: selectedVariants,
      });
    }
    localStorage.setItem("kaizen_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const submitOrder = async () => {
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      setFormError("Please fill in name, email and phone.");
      return;
    }
    setFormStatus("loading");
    setFormError("");
    if (supabase && product) {
      const { error } = await supabase.from("consultation_requests").insert([{
        name: orderForm.name,
        email: orderForm.email,
        phone: orderForm.phone,
        message: `Order request for: ${product.name}${variantSummary ? ` (${variantSummary})` : ""}, Qty: ${quantity}. ${orderForm.message}`,
        setup_type: product.category,
        status: "pending",
      }]);
      if (error) { setFormStatus("error"); setFormError("Something went wrong. Try again."); return; }
    }
    setFormStatus("success");
  };

  const waMessage = product
    ? encodeURIComponent(`Hi KaizenSetup! I'd like to order the ${product.name}${variantSummary ? ` (${variantSummary})` : ""}, Qty: ${quantity}. Please confirm price and availability.`)
    : "";

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h1>
          <Link href="/shop" className="text-blue-500 hover:underline text-sm">← Back to Shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline mb-8">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        {/* Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">

          {/* Image Gallery */}
          <div className="flex flex-col gap-3">
            <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl h-80 flex items-center justify-center p-6">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-opacity duration-200"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden bg-white dark:bg-[#111] transition-colors ${
                      activeImg === i ? "border-blue-500" : "border-gray-200 dark:border-gray-800 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-2">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex flex-col gap-4 mb-6">
                {product.variants.map((variant) => (
                  <div key={variant.name}>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {variant.name}
                      {selectedVariants[variant.name] && (
                        <span className="font-normal text-blue-500 ml-2">{selectedVariants[variant.name]}</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variant.name === "Color"
                        ? variant.options.map((opt) => {
                            const colorMap: Record<string, { bg: string; text: string }> = {
                              Yellow: { bg: "#FACC15", text: "#000000" },
                              Green: { bg: "#22C55E", text: "#ffffff" },
                              Blue: { bg: "#3B82F6", text: "#ffffff" },
                            };
                            const isSelected = selectedVariants[variant.name] === opt;
                            const colors = colorMap[opt];
                            return (
                              <button key={opt}
                                onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt }))}
                                style={isSelected ? { backgroundColor: colors?.bg, color: colors?.text } : {}}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                  isSelected ? "border-transparent" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500"
                                }`}>
                                {opt}
                              </button>
                            );
                          })
                        : variant.options.map((opt) => (
                            <button key={opt}
                              onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt }))}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                selectedVariants[variant.name] === opt
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500"
                              }`}>
                              {opt}
                            </button>
                          ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            {effectivePrice ? (
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ₦{effectivePrice.toLocaleString()}
              </p>
            ) : hasVariantPricing && minVariantPrice ? (
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                from ₦{minVariantPrice.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-gray-400 mb-4">Price available on request</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</p>
              <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">
                  {quantity}
                </span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button onClick={addToCart}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 hover:bg-blue-400 text-white"
                }`}>
                {addedToCart ? <><Check size={16} /> Added to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
              </button>
              <a href={`https://wa.me/2347035378462?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 py-3 rounded-lg font-semibold text-sm transition-colors">
                <MessageCircle size={16} /> Order via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Place an Order Request</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Fill in your details and we'll get back to you within 24 hours.
          </p>
          {formStatus === "success" ? (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-blue-700 dark:text-blue-400 text-sm font-medium">
              ✓ Order request received! We'll contact you shortly.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="name" value={orderForm.name} onChange={handleInput} placeholder="Your Name"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                <input name="phone" value={orderForm.phone} onChange={handleInput} placeholder="Phone Number"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <input name="email" value={orderForm.email} onChange={handleInput} placeholder="Email Address" type="email"
                className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <textarea name="message" value={orderForm.message} onChange={handleInput}
                placeholder="Any specific requirements? (optional)" rows={3}
                className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              {formError && <p className="text-red-500 text-xs">{formError}</p>}
              <button onClick={submitOrder} disabled={formStatus === "loading"}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm transition-colors">
                <ShoppingCart size={16} />
                {formStatus === "loading" ? "Submitting..." : "Submit Order Request"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}