"use client";

import { useEffect, useState } from "react";

const TRUST_SIGNALS = [
  "Real testing, not spec sheets",
  "Budget-first thinking",
  "Zero corporate fluff",
];

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 overflow-hidden bg-white dark:bg-[#0f0f0f]"
    >
      {/* Tech grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400 opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

      <div
        className={`max-w-4xl mx-auto relative z-10 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-4">
          Ibadan, Nigeria · Est. 2024
        </span>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
          Smart & Affordable <br />
          <span className="text-emerald-500">Tech Setups</span> in Nigeria
        </h1>

        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
          We help you build efficient workspaces, gaming stations, and business
          tech systems — without overspending or falling for marketing hype.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="#contact"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          >
            Book a Consultation
          </a>
          <a
            href="#reviews"
            className="border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          >
            View Reviews
          </a>
        </div>

        <div className="mt-16 flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
          {TRUST_SIGNALS.map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}