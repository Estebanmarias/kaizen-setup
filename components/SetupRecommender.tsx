"use client";

import { useState } from "react";
import { X, Sparkles, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Recommendation = {
  id: string;
  slug: string;
  name: string;
  reason: string;
  image_url: string | null;
  price_naira: number | null;
  category: string;
};

const STEPS = [
  {
    key: "budget",
    question: "What's your budget?",
    options: [
      "Under ₦50,000",
      "₦50,000 – ₦150,000",
      "₦150,000 – ₦300,000",
      "Above ₦300,000",
    ],
  },
  {
    key: "useCase",
    question: "What's your primary use?",
    options: ["Home Office", "Gaming", "Business", "Content Creation"],
  },
  {
    key: "existing",
    question: "What do you already have?",
    options: [
      "Nothing yet — starting fresh",
      "I have a monitor",
      "I have a desk + chair",
      "Most things — just need accessories",
    ],
  },
];

type Answers = { budget: string; useCase: string; existing: string };

export default function SetupRecommender() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState("");

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
    setError("");
    setLoading(false);
  };

  const close = () => { setOpen(false); setTimeout(reset, 300); };

  const handleOption = async (value: string) => {
    const key = STEPS[step].key as keyof Answers;
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      return;
    }

    // Last step — call API
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResults(data.recommendations);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const addToCart = (rec: Recommendation) => {
    const cart = JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]");
    const key = `${rec.id}-`;
    const idx = cart.findIndex((i: any) => i.id === key);
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({
      id: key, name: rec.name, slug: rec.slug,
      image_url: rec.image_url, price_naira: rec.price_naira,
      quantity: 1, variants: {},
    });
    localStorage.setItem("kaizen_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors shadow-lg shadow-blue-500/20">
        <Sparkles size={15} />
        Build My Setup with AI
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles size={15} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">AI Setup Recommender</p>
                  <p className="text-xs text-gray-400">3 quick questions</p>
                </div>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Loader2 size={22} className="text-blue-500 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">Building your setup...</p>
                    <p className="text-xs text-gray-400 mt-1">AI is picking the best products for you</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-4">{error}</p>
                  <button onClick={reset} className="text-blue-500 text-sm hover:underline">Try again</button>
                </div>
              )}

              {/* Questions */}
              {!loading && !results && !error && (
                <div>
                  {/* Progress bar */}
                  <div className="w-full h-1 bg-gray-100 rounded-full mb-6">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }} />
                  </div>

                  <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-2">
                    Question {step + 1} of {STEPS.length}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900 mb-5">{currentStep.question}</h2>

                  <div className="flex flex-col gap-2.5">
                    {currentStep.options.map(opt => (
                      <button key={opt} onClick={() => handleOption(opt)}
                        className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all group text-left">
                        {opt}
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  {step > 0 && (
                    <button onClick={() => setStep(s => s - 1)}
                      className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      ← Back
                    </button>
                  )}
                </div>
              )}

              {/* Results */}
              {!loading && results && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Your personalised setup</p>
                      <p className="text-xs text-gray-400">{results.length} products recommended</p>
                    </div>
                    <button onClick={reset} className="text-xs text-blue-500 hover:underline">Start over</button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {results.map(rec => (
                      <div key={rec.slug} className="flex gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3 hover:border-blue-200 transition-colors">
                        <div className="relative w-16 h-16 bg-white rounded-xl border border-gray-100 flex-shrink-0 overflow-hidden">
                          {rec.image_url
                            ? <Image src={rec.image_url} alt={rec.name} fill className="object-contain p-1" />
                            : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-blue-500 mb-0.5">{rec.category}</p>
                          <p className="text-sm font-semibold text-gray-900 leading-snug truncate">{rec.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{rec.reason}</p>
                          {rec.price_naira && (
                            <p className="text-xs font-bold text-gray-900 mt-1">₦{rec.price_naira.toLocaleString()}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button onClick={() => addToCart(rec)}
                            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition-colors" title="Add to cart">
                            <ShoppingCart size={13} />
                          </button>
                          <Link href={`/shop/${rec.slug}`} onClick={close}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="View product">
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link href="/cart" onClick={close}
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                    <ShoppingCart size={15} /> View Cart
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}