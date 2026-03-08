"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MessageCircle, ShoppingCart, ArrowLeft, Plus, Minus, Check, Share2, Copy, CheckCheck, CreditCard, Loader2, Star } from "lucide-react";
import Link from "next/link";

type Variant = {
  name?: string;
  options?: string[];
  prices?: number[];
  combo_prices?: Record<string, number>;
};

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

type Review = {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  user_id: string;
};

function isComboProduct(variants: Variant[] | null) {
  return !!(variants?.find(v => v.combo_prices));
}
function getComboPrice(variants: Variant[] | null, selected: Record<string, string>): number | null {
  const comboPrices = variants?.find(v => v.combo_prices)?.combo_prices;
  if (!comboPrices) return null;
  const key = variants!.filter(v => v.name && v.options).map(g => selected[g.name!] ?? "").join("|");
  return comboPrices[key] ?? null;
}
function getComboMin(variants: Variant[] | null): number | null {
  const cp = variants?.find(v => v.combo_prices)?.combo_prices;
  return cp ? Math.min(...Object.values(cp)) : null;
}
function allComboSelected(variants: Variant[] | null, selected: Record<string, string>) {
  return variants?.filter(v => v.name && v.options).every(g => !!selected[g.name!]) ?? true;
}

// ── Star Rating Input ──────────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110">
          <Star size={24}
            className={n <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-700"}
          />
        </button>
      ))}
    </div>
  );
}

// ── Star Display ───────────────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={14}
          className={n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-700"}
        />
      ))}
    </div>
  );
}

// ── Share Bar ──────────────────────────────────────────────────────────────────
function ShareBar({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.kaizensetup.name.ng/shop/${slug}`;
  const text = `Check out ${name} on KaizenSetup!`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWA = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
  const shareX  = () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Share2 size={12} /> Share:</span>
      <button onClick={shareWA}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.428a.75.75 0 0 0 .916.916l5.579-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.945-1.355l-.355-.21-3.676.968.984-3.595-.229-.368A9.698 9.698 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
        WhatsApp
      </button>
      <button onClick={shareX}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </button>
      <button onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
        {copied ? <><CheckCheck size={12} className="text-green-500" /> Copied!</> : <><Copy size={12} /> Copy link</>}
      </button>
    </div>
  );
}

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
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [reviewError, setReviewError] = useState("");

 useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuthEmail(data.session.user.email ?? null);
        setAuthUserId(data.session.user.id);
        setAuthToken(data.session.access_token);
      }
    });
  }, []);

  useEffect(() => {
    if (!supabase || !slug) return;
    supabase.from("products").select("*").eq("slug", slug).single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
        if (data?.variants) {
          const defaults: Record<string, string> = {};
          data.variants.filter((v: Variant) => v.name && v.options).forEach((v: Variant) => {
            defaults[v.name!] = v.options![0];
          });
          setSelectedVariants(defaults);
        }
      });
  }, [slug]);

  // Fetch approved reviews
  useEffect(() => {
    if (!supabase || !product) return;
    supabase.from("reviews")
      .select("id, rating, body, created_at, user_id")
      .eq("product_id", product.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews(data ?? []));
  }, [product]);

  // Check if user has ordered this product + already reviewed
  useEffect(() => {
    if (!supabase || !product || !authUserId || !authEmail) return;

    // Check ordered
    supabase.from("consultation_requests")
      .select("id, items")
      .eq("email", authEmail)
      .then(({ data }) => {
        const ordered = (data ?? []).some(order =>
          (order.items ?? []).some((item: { name: string }) => item.name === product.name)
        );
        setHasOrdered(ordered);
      });

    // Check already reviewed
    supabase.from("reviews")
      .select("id")
      .eq("product_id", product.id)
      .eq("user_id", authUserId)
      .then(({ data }) => setAlreadyReviewed((data ?? []).length > 0));
  }, [product, authUserId, authEmail]);

  const images = product
    ? (product.images?.length ? product.images : product.image_url ? [product.image_url] : ["/images/products/placeholder.jpg"])
    : [];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });

  const variantSummary = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ");

  const isCombo = isComboProduct(product?.variants ?? null);
  const comboPrice = isCombo ? getComboPrice(product?.variants ?? null, selectedVariants) : null;
  const comboMin = isCombo ? getComboMin(product?.variants ?? null) : null;
  const canAddToCart = !isCombo || allComboSelected(product?.variants ?? null, selectedVariants);

  const perOptionPrice = (() => {
    if (!product?.variants || isCombo) return null;
    for (const v of product.variants) {
      if (v.prices && v.name && selectedVariants[v.name]) {
        const idx = v.options?.indexOf(selectedVariants[v.name]) ?? -1;
        if (idx >= 0) return v.prices[idx];
      }
    }
    return null;
  })();

  const effectivePrice = comboPrice ?? perOptionPrice ?? product?.price_naira ?? null;
  const hasVariantPricing = !isCombo && product?.variants?.some(v => v.prices?.length);
  const minVariantPrice = hasVariantPricing
    ? Math.min(...(product!.variants!.flatMap(v => v.prices ?? [])))
    : null;

  const addToCart = () => {
    if (!product || !canAddToCart) return;
    const cart: CartItem[] = JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]");
    const key = `${product.id}-${variantSummary}`;
    const existing = cart.findIndex(i => i.id === key);
    if (existing >= 0) cart[existing].quantity += quantity;
    else cart.push({ id: key, name: product.name, slug: product.slug, image_url: images[0] ?? null, price_naira: effectivePrice, quantity, variants: selectedVariants });
    localStorage.setItem("kaizen_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const submitOrder = async () => {
    if (!orderForm.name || !(authEmail ?? orderForm.email) || !orderForm.phone) {
      setFormError("Please fill in name, email and phone.");
      return;
    }
    setFormStatus("loading");
    setFormError("");
    if (supabase && product) {
      const items = [{ name: product.name, quantity, price: effectivePrice ?? undefined, variant: variantSummary || undefined }];
      const { error } = await supabase.from("consultation_requests").insert([{
        name: orderForm.name, email: authEmail ?? orderForm.email, phone: orderForm.phone,
        message: orderForm.message || null, setup_type: product.category, status: "pending",
        items, total_naira: effectivePrice ? effectivePrice * quantity : null,
        user_id: authUserId ?? null,
      }]);
      if (error) { setFormStatus("error"); setFormError("Something went wrong. Try again."); return; }
    }
    setFormStatus("success");
  };

  const handlePaystack = async () => {
    if (!orderForm.name || !(authEmail ?? orderForm.email) || !orderForm.phone) {
      setFormError("Please fill in name, email and phone.");
      return;
    }
    if (!effectivePrice || !product) {
      setFormError("Price not available for payment. Use WhatsApp instead.");
      return;
    }
    setFormError("");
    setPayLoading(true);
    const orderTotal = effectivePrice * quantity;
    const PaystackPop = (await import("@paystack/inline-js")).default;
    const handler = new PaystackPop();
    handler.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
      email: authEmail ?? orderForm.email,
      amount: orderTotal * 100,
      currency: "NGN",
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "name", value: orderForm.name },
          { display_name: "Phone", variable_name: "phone", value: orderForm.phone },
          { display_name: "Product", variable_name: "product", value: product.name },
        ],
      },
      onSuccess: async (transaction: { reference: string }) => {
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              reference: transaction.reference,
              orderData: {
                name: orderForm.name, email: authEmail ?? orderForm.email, phone: orderForm.phone,
                message: orderForm.message || null, setup_type: product.category,
                items: [{ name: product.name, quantity, price: effectivePrice, variant: variantSummary || undefined }],
                total_naira: orderTotal,
              },
            }),
          });
          const data = await res.json();
          if (!res.ok) { setFormError(data.error ?? "Payment verified but order failed. Contact us."); setPayLoading(false); return; }
          setFormStatus("success");
        } catch {
          setFormError("Order saving failed. Please contact us with your payment reference.");
          setPayLoading(false);
        }
      },
      onCancel: () => { setFormError("Payment cancelled."); setPayLoading(false); },
    });
  };

  const submitReview = async () => {
    if (!reviewRating) { setReviewError("Please select a star rating."); return; }
    if (!reviewBody.trim()) { setReviewError("Please write a review."); return; }
    if (!authUserId || !product) return;
    setReviewStatus("loading");
    setReviewError("");
    const { error } = await supabase!.from("reviews").insert([{
      product_id: product.id,
      user_id: authUserId,
      rating: reviewRating,
      body: reviewBody.trim(),
      status: "pending",
    }]);
    if (error) { setReviewStatus("error"); setReviewError("Something went wrong. Try again."); return; }
    setReviewStatus("success");
    setAlreadyReviewed(true);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const waMessage = product
    ? encodeURIComponent(`Hi KaizenSetup! I'd like to order the ${product.name}${variantSummary ? ` (${variantSummary})` : ""}, Qty: ${quantity}. Please confirm price and availability.`)
    : "";

  if (loading) return (
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

  if (!product) return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h1>
        <Link href="/shop" className="text-blue-500 hover:underline text-sm">← Back to Shop</Link>
      </div>
    </main>
  );

  const namedVariants = product.variants?.filter(v => v.name && v.options) ?? [];

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline mb-8">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div className="flex flex-col gap-3">
           <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl h-80 flex items-center justify-center p-6 overflow-hidden">
              <img src={images[activeImg]} alt={product.name} className="max-h-full max-w-full object-contain transition-opacity duration-200" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden bg-white dark:bg-[#111] transition-colors ${activeImg === i ? "border-blue-500" : "border-gray-200 dark:border-gray-800 hover:border-gray-400"}`}>
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-2">{product.category}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>

            {/* Avg rating inline */}
            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <StarDisplay rating={Math.round(Number(avgRating))} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{avgRating}</span>
                <span className="text-xs text-gray-400">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>
            )}

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{product.description}</p>

            {namedVariants.length > 0 && (
              <div className="flex flex-col gap-4 mb-6">
                {namedVariants.map(variant => (
                  <div key={variant.name}>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {variant.name}{selectedVariants[variant.name!] && <span className="font-normal text-blue-500 ml-2">{selectedVariants[variant.name!]}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variant.name === "Color"
                        ? variant.options!.map(opt => {
                            const colorMap: Record<string, { bg: string; text: string }> = {
                              Yellow: { bg: "#FACC15", text: "#000000" }, Green: { bg: "#22C55E", text: "#ffffff" },
                              Blue: { bg: "#3B82F6", text: "#ffffff" }, Red: { bg: "#EF4444", text: "#ffffff" },
                              Black: { bg: "#111111", text: "#ffffff" }, White: { bg: "#ffffff", text: "#111111" }, Grey: { bg: "#6B7280", text: "#ffffff" },
                            };
                            const isSelected = selectedVariants[variant.name!] === opt;
                            const colors = colorMap[opt];
                            return (
                              <button key={opt} onClick={() => setSelectedVariants(p => ({ ...p, [variant.name!]: opt }))}
                                style={isSelected ? { backgroundColor: colors?.bg, color: colors?.text } : {}}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isSelected ? "border-transparent" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500"}`}>
                                {opt}
                              </button>
                            );
                          })
                        : variant.options!.map(opt => (
                            <button key={opt} onClick={() => setSelectedVariants(p => ({ ...p, [variant.name!]: opt }))}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedVariants[variant.name!] === opt ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500"}`}>
                              {opt}
                            </button>
                          ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isCombo ? (
              comboPrice
                ? <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">₦{comboPrice.toLocaleString()}</p>
                : <p className="text-sm text-gray-400 mb-4">{allComboSelected(product.variants, selectedVariants) ? "Price on request" : `from ₦${comboMin?.toLocaleString()} — select all options to see exact price`}</p>
            ) : effectivePrice
              ? <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">₦{effectivePrice.toLocaleString()}</p>
              : hasVariantPricing && minVariantPrice
                ? <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">from ₦{minVariantPrice.toLocaleString()}</p>
                : <p className="text-sm text-gray-400 mb-4">Price available on request</p>
            }

            <div className="flex items-center gap-3 mb-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</p>
              <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Minus size={14} /></button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Plus size={14} /></button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {product.in_stock ? (
                <>
                  {isCombo && !canAddToCart && <p className="text-xs text-gray-400 text-center">Select all options to add to cart</p>}
                  <button onClick={addToCart} disabled={!canAddToCart}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-colors ${addedToCart ? "bg-green-500 text-white" : canAddToCart ? "bg-blue-500 hover:bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"}`}>
                    {addedToCart ? <><Check size={16} /> Added to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
                  </button>
                  <a href={`https://wa.me/2347035378462?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 py-3 rounded-lg font-semibold text-sm transition-colors">
                    <MessageCircle size={16} /> Order via WhatsApp
                  </a>
                </>
              ) : (
                <button disabled className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-400 py-3 rounded-lg font-semibold text-sm cursor-not-allowed">
                  Out of Stock
                </button>
              )}
            </div>
            <ShareBar name={product.name} slug={product.slug} />
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Place an Order Request</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill in your details and we'll get back to you within 24 hours.</p>
          {formStatus === "success" ? (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-blue-700 dark:text-blue-400 text-sm font-medium">
              ✓ Order request received! We'll contact you shortly.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="name" value={orderForm.name} onChange={handleInput} placeholder="Your Name" className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                <input name="phone" value={orderForm.phone} onChange={handleInput} placeholder="Phone Number" className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <input name="email" value={authEmail ?? orderForm.email} onChange={e => !authEmail && handleInput(e)} placeholder="Email Address" type="email" readOnly={!!authEmail}
                className={`px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors ${authEmail ? "opacity-60 cursor-not-allowed" : ""}`} />
              <textarea name="message" value={orderForm.message} onChange={handleInput} placeholder="Any specific requirements? (optional)" rows={3} className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              {formError && <p className="text-red-500 text-xs">{formError}</p>}
              {effectivePrice && (
                <button onClick={handlePaystack} disabled={payLoading}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm transition-colors">
                  {payLoading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                  {payLoading ? "Processing..." : `Pay ₦${(effectivePrice * quantity).toLocaleString()}`}
                </button>
              )}
              <button onClick={submitOrder} disabled={formStatus === "loading"}
                className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 py-3 rounded-lg font-semibold text-sm transition-colors">
                <ShoppingCart size={16} />
                {formStatus === "loading" ? "Submitting..." : "Request Without Paying"}
              </button>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
              {avgRating && (
                <div className="flex items-center gap-2 mt-1">
                  <StarDisplay rating={Math.round(Number(avgRating))} />
                  <span className="text-sm text-gray-500">{avgRating} out of 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>

          {/* Write a review */}
          {!authUserId ? (
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Sign in to leave a review</p>
              <Link href="/auth" className="inline-block px-5 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors">
                Sign In
              </Link>
            </div>
          ) : !hasOrdered ? (
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Only customers who have ordered this product can leave a review.</p>
            </div>
          ) : alreadyReviewed ? (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">✓ You've already submitted a review for this product.</p>
            </div>
          ) : reviewStatus === "success" ? (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">✓ Review submitted! It'll appear once approved.</p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Your rating</p>
                  <StarInput value={reviewRating} onChange={setReviewRating} />
                </div>
                <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                  placeholder="Share your experience with this product..." rows={4}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                {reviewError && <p className="text-red-500 text-xs">{reviewError}</p>}
                <button onClick={submitReview} disabled={reviewStatus === "loading"}
                  className="self-start flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                  {reviewStatus === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  {reviewStatus === "loading" ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No reviews yet. Be the first to review this product.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <StarDisplay rating={r.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}