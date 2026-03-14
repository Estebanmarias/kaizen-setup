"use client";

import { useEffect, useState } from "react";

const TRUST_SIGNALS = [
  "Real testing, not spec sheets",
  "Budget-first thinking",
  "Zero corporate fluff",
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex flex-col px-6 pt-24 pb-20 md:min-h-screen md:justify-center md:pt-40 md:pb-24 overflow-hidden bg-white"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.04,
        }}
      />

      {/* Subtle glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gray-300 opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <span 
          className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-500 mb-4"
          data-aos="fade-down"
          data-aos-delay="200"
        >
          Ibadan, Nigeria · Est. 2024
        </span>

        <h1 
          className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          Smart & Affordable <br />
          <span className="text-gray-400">Tech Setups</span> in Nigeria
        </h1>

        <p 
          className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          We help you build efficient workspaces, gaming stations, and business
          tech systems — without overspending or falling for marketing hype.
        </p>

        <div 
          className="flex flex-wrap gap-4"
          data-aos="fade-up"
          data-aos-delay="800"
        >
          <a href="#contact"
            className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">
            Book a Consultation
          </a>
          <a href="#reviews"
            className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">
            View Reviews
          </a>
        </div>

        <div 
          className="mt-12 md:mt-16 flex flex-wrap gap-6 text-sm text-gray-500"
          data-aos="fade-up"
          data-aos-delay="1000"
        >
          {TRUST_SIGNALS.map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="text-blue-500 font-bold">✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}