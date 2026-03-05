"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle, ShoppingCart, X } from "lucide-react";
import Link from "next/link";

const PRODUCT_IMAGES: Record<string, string> = {
  'Xiaomi 34" Monitor G34QW': "https://i05.appmifile.com/584_item_uk/20/08/2024/697b272616dc15c9f730a88f5d418ea1.png?thumb=1&w=600&f=webp&q=85",
  "Mi Computer Monitor Light Bar": "https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1643183298.41047328.png?thumb=1&w=600&f=webp&q=85",
  "Wireless Tag Dual Tracker": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTeOextV8rHWqU8EblJW1foD9HnWWvLANyIsu_FDsYbrsZ1rZlUeWOhcxGVD6rbgRYqDDVX5EHW0LnWMEbkJ_Yi7OYHnmRlSs7abe_teBeS2AArbMb7pZGXtjwD-nO1yqKWrdpk2BA&usqp=CAc",
  "Logitech MX Master 4": "https://resource.logitech.com/w_416,h_312,ar_4:3,c_pad,q_auto,f_auto,dpr_2.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-4/gallery/mx-master-4-graphite-software-angle-gallery-7.png",
  "Logitech MX Keys S": "https://resource.logitech.com/w_544,h_466,ar_7:6,c_pad,q_auto,f_auto,dpr_2.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/mx-keys-s/migration-assets-for-delorean-2025/gallery/mx-keys-s-top-view-graphite-ukr.png",
  "Logitech MX Keys Mini": "https://resource.logitech.com/w_416,h_312,ar_4:3,c_pad,q_auto,f_auto,dpr_2.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/mx-keys-mini/gallery/deu/mx-keys-mini-3q-tilted-graphite-deu.png",
  "CX23 Mechanical Keyboard": "/images/products/cx23-keyboard.jpg",
};

const CATEGORIES = ["All", "Monitors", "Keyboards", "Mice", "Accessories"];

type Product = {
  id: string;
  name: string;
  description: string;
  price_naira: number | null;
  category: string;
  partner: string | null;
  in_stock: boolean;
};

function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in name, email and phone.");
      return;
    }
    setLoading(true);
    setError("");
    if (supabase) {
      await supabase.from("consultation_requests").insert([{
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `Order request for: ${product.name}. ${form.message}`,
        setup_type: product.category,
        status: "pending",
      }]);
    }
    setLoading(false);
    setSuccess(true);
  };

  const waMessage = encodeURIComponent(
    `Hi KaizenSetup! I'm interested in ordering the ${product.name}. Please let me know the price and availability.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md relative shadow-2xl border border-gray-200 dark:border-gray-800">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Order Request</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{product.name}</p>

        {success ? (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-blue-700 dark:text-blue-400 text-sm font-medium">
            ✓ Order request received! We'll contact you shortly.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-4">
              <input name="name" value={form.name} onChange={handle} placeholder="Your Name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <input name="email" value={form.email} onChange={handle} placeholder="Email Address" type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <input name="phone" value={form.phone} onChange={handle} placeholder="Phone Number"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
              <textarea name="message" value={form.message} onChange={handle}
                placeholder="Any specific requirements? (optional)" rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button onClick={submit} disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors mb-3">
              {loading ? "Submitting..." : "Submit Order Request"}
            </button>
          </>
        )}

        <a href={`https://wa.me/2347035378462?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 py-2.5 rounded-lg font-semibold text-sm transition-colors">
          <MessageCircle size={16} />
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from("products").select("*").eq("in_stock", true)
      .then(({ data }) => {
        setProducts(data ?? []);
        setFiltered(data ?? []);
        setLoading(false);
      });
  }, []);

  const filter = (cat: string) => {
    setActive(cat);
    setFiltered(cat === "All" ? products : products.filter(p => p.category === cat));
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      {selected && <OrderModal product={selected} onClose={() => setSelected(null)} />}

      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          The Shop
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Products
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl">
          Tested and recommended gear. Every product on this page has been used or reviewed by KaizenSetup.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => filter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                active === cat
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-500"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i}
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 animate-pulse h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div key={p.id}
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-colors flex flex-col">
                <div className="bg-white dark:bg-[#111] h-52 flex items-center justify-center p-4">
                  <img
                    src={PRODUCT_IMAGES[p.name] ?? "/images/products/placeholder.jpg"}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-blue-500 mb-1">{p.category}</span>
                  <h2 className="font-semibold text-base text-gray-900 dark:text-white mb-2">{p.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-4">
                    {p.description}
                  </p>
                  {p.price_naira && (
                    <p className="font-bold text-gray-900 dark:text-white mb-4">
                      ₦{p.price_naira.toLocaleString()}
                    </p>
                  )}
                  <button onClick={() => setSelected(p)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
                    <ShoppingCart size={16} />
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}