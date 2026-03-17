"use client";

import { useState } from "react";
import { X, ChevronRight, Activity, ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";

const LETTERS = ["A", "B", "C", "D"];

const QUESTIONS = [
  {
    id: "hours",
    title: "How many hours a day do you spend at your desk?",
    options: [
      { label: "1–3 hours", score: 20 },
      { label: "4–8 hours", score: 10 },
      { label: "8+ hours (I live here)", score: 0 },
    ],
  },
  {
    id: "pain",
    title: "What is your biggest physical complaint?",
    options: [
      { label: "None, I feel great", score: 20 },
      { label: "Neck or shoulder stiffness", score: 5, painPoint: "neck" },
      { label: "Lower back pain", score: 5, painPoint: "back" },
      { label: "Wrist fatigue", score: 5, painPoint: "wrist" },
    ],
  },
  {
    id: "lighting",
    title: "What is your current lighting setup?",
    options: [
      { label: "Dedicated desk lamp or light bar", score: 20 },
      { label: "Near a bright, natural window", score: 15 },
      { label: "Just the room ceiling light", score: 0 },
    ],
  },
  {
    id: "clutter",
    title: "How cluttered is your desk right now?",
    options: [
      { label: "Minimalist & clean", score: 20 },
      { label: "A few things here and there", score: 10 },
      { label: "Absolute chaos", score: 0 },
    ],
  },
  {
    id: "budget",
    title: "What is your upgrade budget?",
    options: [
      { label: "Under ₦50k", score: 20, budget: "low" },
      { label: "₦50k – ₦150k", score: 20, budget: "mid" },
      { label: "₦150k+", score: 20, budget: "high" },
    ],
  },
];

// Smart recommendation engine mapping to actual search queries
const getRecommendation = (painPoint: string, budget: string) => {
  if (budget === "low") {
    return {
      title: "The Quick Fix Bundle",
      desc: "A heavy-duty laptop stand and an ergonomic mouse pad to instantly fix your viewing angle and wrist posture without breaking the bank.",
      link: "/search?q=stand",
    };
  }
  if (painPoint === "neck" || painPoint === "wrist") {
    return {
      title: "The Posture Bundle",
      desc: "An aluminum gas-spring monitor arm combined with the CX23 Keyboard and G30LD Mouse. Gets your screen at eye level and fixes wrist strain.",
      link: "/search?q=ergonomic",
    };
  }
  return {
    title: "The Full Ergonomic Upgrade",
    desc: "A premium ergonomic mesh chair paired with a solid desk foundation. The ultimate fix for long hours and back pain.",
    link: "/shop?category=Desk%20%26%20Seating",
  };
};

export default function WorkspaceScoreTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (option: any) => {
    const currentQ = QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setIsCalculating(true);
      setTimeout(() => {
        setIsCalculating(false);
        setShowResults(true);
      }, 1800);
    }
  };

  const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
  const painAnswer = answers["pain"]?.painPoint || "none";
  const budgetAnswer = answers["budget"]?.budget || "mid";
  const recommendation = getRecommendation(painAnswer, budgetAnswer);

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-blue-500/20"
      >
        <Activity size={18} /> Get Your Workspace Score
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col min-h-[480px] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Activity size={16} className="text-blue-500" />
                </div>
                <span className="font-bold text-gray-900 text-sm tracking-wide uppercase">Workspace Analyzer</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Progress Bar (Moved to Top) */}
            {!isCalculating && !showResults && (
              <div className="h-1.5 w-full bg-gray-100">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${((step) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            )}

            {/* Content Area */}
            <div className="p-6 md:p-10 flex-1 flex flex-col justify-center bg-gray-50/30">
              {isCalculating ? (
                <div className="text-center flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                    <Sparkles size={20} className="text-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Crunching the numbers...</p>
                    <p className="text-sm text-gray-500">Finding your weakest link.</p>
                  </div>
                </div>
              ) : showResults ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
                  <div className="text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Your Score</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-7xl font-black tracking-tighter ${totalScore >= 80 ? "text-green-500" : totalScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                        {totalScore}
                      </span>
                      <span className="text-3xl text-gray-300 font-bold">/100</span>
                    </div>
                    <p className="text-base text-gray-600 mt-4 max-w-sm mx-auto font-medium">
                      {totalScore >= 80 ? "Your setup is incredibly optimized. You just need minor tweaks." : 
                       totalScore >= 50 ? "You have a decent foundation, but bad ergonomics are holding you back." : 
                       "Your setup is actively working against your body and productivity."}
                    </p>
                  </div>

                  <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sparkles size={14} /> Recommended Fix
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{recommendation.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-md">{recommendation.desc}</p>
                    <Link href={recommendation.link} onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors">
                      <ShoppingCart size={16} /> Shop this fix
                    </Link>
                  </div>

                  <button onClick={reset} className="w-full text-center text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                    Retake Quiz
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in slide-in-from-right-8 fade-in duration-500">
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
                        className="flex items-center w-full p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all duration-200 group shadow-sm hover:shadow-md"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-colors mr-4">
                          {LETTERS[i]}
                        </div>
                        <span className="font-semibold text-gray-700 group-hover:text-blue-700 text-sm md:text-base">{opt.label}</span>
                        <ChevronRight size={18} className="ml-auto text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
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