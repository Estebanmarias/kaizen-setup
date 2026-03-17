"use client";

import { useState } from "react";
import { X, ChevronRight, Activity, ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";

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
      { label: "Neck/Shoulder stiffness", score: 5, painPoint: "neck" },
      { label: "Lower back pain", score: 5, painPoint: "back" },
      { label: "Wrist fatigue", score: 5, painPoint: "wrist" },
    ],
  },
  {
    id: "lighting",
    title: "What is your current lighting setup?",
    options: [
      { label: "Dedicated desk lamp/light bar", score: 20 },
      { label: "Near a bright window", score: 15 },
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

// Smart recommendation engine mapping
const getRecommendation = (painPoint: string, budget: string) => {
  if (budget === "low") {
    return {
      title: "The Quick Fix Bundle",
      desc: "A heavy-duty laptop stand and an ergonomic mouse pad to instantly fix your viewing angle and wrist posture without breaking the bank.",
      link: "/shop",
    };
  }
  if (painPoint === "neck" || painPoint === "wrist") {
    return {
      title: "The Posture Bundle",
      desc: "An aluminum gas-spring monitor arm combined with the CX23 Keyboard and G30LD Mouse. Gets your screen at eye level and fixes wrist strain.",
      link: "/shop",
    };
  }
  return {
    title: "The Full Ergonomic Upgrade",
    desc: "A premium ergonomic mesh chair paired with a solid desk foundation. The ultimate fix for long hours and back pain.",
    link: "/shop",
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
      // Calculate Results
      setIsCalculating(true);
      setTimeout(() => {
        setIsCalculating(false);
        setShowResults(true);
      }, 1500);
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
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm"
      >
        <Activity size={16} /> Get Your Workspace Score
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                <span className="font-bold text-gray-900">Workspace Analyzer</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 min-h-[360px] flex flex-col justify-center">
              {isCalculating ? (
                <div className="text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-gray-900 animate-pulse">Analyzing your setup...</p>
                </div>
              ) : showResults ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Your Score</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-6xl font-bold tracking-tighter ${totalScore >= 80 ? "text-green-500" : totalScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                        {totalScore}
                      </span>
                      <span className="text-2xl text-gray-400 font-medium">/100</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 max-w-xs mx-auto">
                      {totalScore >= 80 ? "Your setup is incredibly optimized. You just need minor tweaks." : 
                       totalScore >= 50 ? "You have a decent foundation, but ergonomics are holding you back." : 
                       "Your setup is actively working against your body and productivity."}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Recommended Upgrade</p>
                    <h3 className="font-bold text-gray-900 mb-2">{recommendation.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{recommendation.desc}</p>
                    <Link href={recommendation.link} onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      <ShoppingCart size={14} /> Shop this fix
                    </Link>
                  </div>

                  <button onClick={reset} className="w-full text-center text-sm text-gray-400 hover:text-gray-900 transition-colors">
                    Retake Quiz
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-blue-500 mb-2">Question {step + 1} of {QUESTIONS.length}</p>
                    <h2 className="text-2xl font-bold text-gray-900 leading-snug">{QUESTIONS[step].title}</h2>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    {QUESTIONS[step].options.map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSelect(opt)}
                        className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-left transition-all group"
                      >
                        <span className="font-medium text-gray-700 group-hover:text-blue-700">{opt.label}</span>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            {!isCalculating && !showResults && (
              <div className="h-1.5 w-full bg-gray-100">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${((step) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}