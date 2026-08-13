"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Activity, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

const LETTERS = ["A", "B", "C", "D"];

type Product = {
  id: string;
  name: string;
  slug: string;
  price_naira: number | null;
  image_url: string | null;
  category: string;
  in_stock: boolean;
};

const QUESTIONS = [
  {
    id: "hours",
    title: "How many hours a day do you spend at your desk?",
    options: [
      { label: "1–3 hours", score: 20, tag: "casual" },
      { label: "4–6 hours", score: 10, tag: "regular" },
      { label: "7–9 hours", score: 5, tag: "heavy" },
      { label: "10+ hours (I live here)", score: 0, tag: "extreme" },
    ],
  },
  {
    id: "pain",
    title: "Any physical discomfort from your current setup?",
    options: [
      { label: "None — I feel great", score: 25, painPoint: "none" },
      { label: "Neck or shoulder stiffness", score: 5, painPoint: "neck" },
      { label: "Lower back pain", score: 5, painPoint: "back" },
      { label: "Wrist or hand fatigue", score: 5, painPoint: "wrist" },
    ],
  },
  {
    id: "lighting",
    title: "What does your lighting situation look like?",
    options: [
      { label: "Dedicated desk lamp or ring light", score: 20, lighting: "good" },
      { label: "Near a bright natural window", score: 15, lighting: "natural" },
      { label: "Just the room ceiling light", score: 5, lighting: "poor" },
      { label: "Screen is my only light source", score: 0, lighting: "bad" },
    ],
  },
  {
    id: "peripherals",
    title: "How would you describe your current peripherals?",
    options: [
      { label: "Mechanical keyboard + ergonomic mouse", score: 20, peripherals: "great" },
      { label: "Decent keyboard, basic mouse", score: 12, peripherals: "decent" },
      { label: "Laptop keyboard only", score: 5, peripherals: "minimal" },
      { label: "Whatever came in the box", score: 0, peripherals: "none" },
    ],
  },
  {
    id: "clutter",
    title: "How would you describe your desk right now?",
    options: [
      { label: "Clean and minimal — everything has a place", score: 15, clutter: "clean" },
      { label: "Organised chaos — I know where things are", score: 10, clutter: "managed" },
      { label: "A few things out of place", score: 5, clutter: "messy" },
      { label: "Absolute disaster zone", score: 0, clutter: "chaos" },
    ],
  },
  {
    id: "budget",
    title: "What's your upgrade budget?",
    options: [
      { label: "Under ₦50k", score: 0, budget: "low" },
      { label: "₦50k – ₦150k", score: 0, budget: "mid" },
      { label: "₦150k – ₦300k", score: 0, budget: "high" },
      { label: "₦300k+", score: 0, budget: "premium" },
    ],
  },
];

// Map pain + peripherals + budget → recommended categories
function getRecommendedCategories(answers: Record<string, any>): string[] {
  const pain = answers["pain"]?.painPoint ?? "none";
  const peripherals = answers["peripherals"]?.peripherals ?? "decent";
  const lighting = answers["lighting"]?.lighting ?? "poor";
  const budget = answers["budget"]?.budget ?? "mid";
  const hours = answers["hours"]?.tag ?? "regular";

  const cats: string[] = [];

  // Ergonomics first
  if (pain === "back" || pain === "neck") cats.push("Desk & Seating");
  if (pain === "wrist" || peripherals === "none" || peripherals === "minimal") {
    cats.push("Keyboards");
    cats.push("Mice");
  }

  // Lighting
  if (lighting === "poor" || lighting === "bad") cats.push("Monitors & Lighting");

  // Heavy users need more
  if (hours === "heavy" || hours === "extreme") {
    if (!cats.includes("Desk & Seating")) cats.push("Desk & Seating");
    cats.push("Accessories");
  }

  // Budget-aware additions
  if (budget === "low") {
    cats.push("Accessories");
    cats.push("Cables & Hubs");
  }
  if (budget === "mid" || budget === "high") {
    cats.push("Monitors");
    cats.push("Smart Home");
  }
  if (budget === "premium") {
    cats.push("Monitors");
    cats.push("Desk & Seating");
    cats.push("Smart Home");
  }

  // Deduplicate and limit to 3
  return [...new Set(cats)].slice(0, 3);
}

function getScoreLabel(score: number): { label: string; color: string; desc: string } {
  if (score >= 80) return {
    label: "Optimized",
    color: "text-green-500",
    desc: "Your setup is dialled in. Minor tweaks will push it to elite.",
  };
  if (score >= 60) return {
    label: "Solid Foundation",
    color: "text-blue-500",
    desc: "Good base but there are clear gaps holding back your productivity.",
  };
  if (score >= 35) return {
    label: "Needs Work",
    color: "text-yellow-500",
    desc: "Your setup is limiting you daily. A few targeted upgrades will make a big difference.",
  };
  return {
    label: "Ergonomic Risk",
    color: "text-red-500",
    desc: "Your current setup is actively working against your body and focus. Time to fix this.",
  };
}

export default function WorkspaceScoreTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score ?? 0), 0);
  const scoreInfo = getScoreLabel(totalScore);

  const fetchRecommendedProducts = async (cats: string[]) => {
    if (!supabase || cats.length === 0) return;
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price_naira, image_url, category, in_stock")
      .in("category", cats)
      .eq("in_stock", true)
      .limit(6);
    setRecommendedProducts(data ?? []);
    setLoadingProducts(false);
  };

  const handleSelect = (option: any) => {
    const currentQ = QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setIsCalculating(true);
      const cats = getRecommendedCategories(newAnswers);
      fetchRecommendedProducts(cats);
      setTimeout(() => {
        setIsCalculating(false);
        setShowResults(true);
      }, 1800);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
    setRecommendedProducts([]);
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-gray-400 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors bg-white"
      >
        <Activity size={15} /> Workspace Score
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={close} />

          <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col min-h-[520px]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Activity size={15} className="text-blue-500" />
                </div>
                <span className="font-bold text-gray-900 text-sm">Workspace Analyzer</span>
              </div>
              <button onClick={close}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Progress bar */}
            {!isCalculating && !showResults && (
              <div className="h-1 w-full bg-gray-100">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">

              {/* Calculating */}
              {isCalculating && (
                <div className="text-center flex flex-col items-center gap-5">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                    <Sparkles size={20} className="text-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Analysing your setup...</p>
                    <p className="text-sm text-gray-400">Finding the right upgrades for you.</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {showResults && !isCalculating && (
                <div className="space-y-6 overflow-y-auto max-h-[60vh]">

                  {/* Score */}
                  <div className="text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Your Workspace Score</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className={`text-7xl font-black tracking-tighter ${scoreInfo.color}`}>
                        {totalScore}
                      </span>
                      <span className="text-3xl text-gray-200 font-bold">/100</span>
                    </div>
                    <span className={`text-sm font-bold ${scoreInfo.color}`}>{scoreInfo.label}</span>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">{scoreInfo.desc}</p>
                  </div>

                  {/* Recommended products */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={13} className="text-blue-500" />
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Recommended for You</p>
                    </div>

                    {loadingProducts ? (
                      <div className="grid grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : recommendedProducts.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">Browse our shop for upgrade ideas.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {recommendedProducts.slice(0, 4).map(p => (
                          <Link
                            key={p.id}
                            href={`/shop/${p.slug}`}
                            onClick={close}
                            className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3 hover:border-blue-500 transition-colors group"
                          >
                            <div className="relative w-10 h-10 rounded-xl bg-white border border-gray-100 flex-shrink-0 overflow-hidden">
                              {p.image_url ? (
                                <Image src={p.image_url} alt={p.name} fill className="object-contain p-1" />
                              ) : (
                                <span className="text-lg flex items-center justify-center w-full h-full">📦</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-500 transition-colors line-clamp-2 leading-snug">{p.name}</p>
                              {p.price_naira && (
                                <p className="text-xs text-blue-500 font-bold mt-0.5">₦{p.price_naira.toLocaleString()}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      href="/shop"
                      onClick={close}
                      className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <ShoppingCart size={15} /> Browse All Products
                    </Link>
                    <a
                      href="#contact"
                      onClick={close}
                      className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:border-gray-400 py-3 rounded-xl font-semibold text-sm transition-colors"
                    >
                      Book a Free Consultation <ArrowRight size={13} />
                    </a>
                  </div>

                  <button onClick={reset} className="w-full text-center text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors pt-1">
                    Retake Quiz
                  </button>
                </div>
              )}

              {/* Question */}
              {!isCalculating && !showResults && (
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">
                      Question {step + 1} of {QUESTIONS.length}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {QUESTIONS[step].title}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                    {QUESTIONS[step].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelect(opt)}
                        className="flex items-center w-full p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all group shadow-sm hover:shadow-md"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-blue-500 group-hover:text-white transition-colors mr-4">
                          {LETTERS[i]}
                        </div>
                        <span className="font-semibold text-gray-700 group-hover:text-blue-700 text-sm flex-1">{opt.label}</span>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}