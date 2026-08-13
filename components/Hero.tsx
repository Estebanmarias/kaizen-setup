"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import WorkspaceScoreTool from "@/components/WorkspaceScoreTool";
import { ArrowRight, Star, MapPin } from "lucide-react";

const TRUST_SIGNALS = [
  "Real testing, not spec sheets",
  "Budget-first thinking",
  "Zero corporate fluff",
];

const STATS = [
  { value: "50+", label: "Setups Built" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "24", label: "Products" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function Hero() {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const section = document.getElementById("home");
    if (!section) return;
    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const handleLeave = () => setMousePos(null);
    section.addEventListener("mousemove", handleMove);
    section.addEventListener("mouseleave", handleLeave);
    return () => {
      section.removeEventListener("mousemove", handleMove);
      section.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden bg-white pt-28 pb-20 md:pt-36 md:pb-28"
    >
      {/* Interactive grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.04,
        }}
      />

      {/* Mouse spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: mousePos
            ? `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59,130,246,0.08), transparent 70%)`
            : "none",
        }}
      />

      {/* Blue glow top left */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[140px] opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* LEFT — Content */}
          <motion.div
            className="lg:col-span-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-blue-600">
                Ibadan, Nigeria · Est. 2024
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl md:text-[3.4rem] font-bold leading-[1.08] tracking-tight text-gray-900 mb-6"
            >
              Smart & Affordable
              <br />
              <span className="text-gray-300">Tech Setups</span>
              <br />
              in Nigeria
            </motion.h1>

            <motion.p variants={item} className="text-lg text-gray-500 max-w-md mb-8 leading-relaxed">
              We help you build efficient workspaces, gaming stations, and
              business tech systems — without overspending or falling for
              marketing hype.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3 mb-10">
              <a href="#contact"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all">
                Book a Consultation <ArrowRight size={14} />
              </a>
              <Link href="/shop"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-gray-400 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors">
                Browse the Shop
              </Link>
              <WorkspaceScoreTool />
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap gap-5 mb-8">
              {TRUST_SIGNALS.map((t) => (
                <span key={t} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </motion.div>

            <motion.div variants={item} className="flex items-center gap-8 pt-6 border-t border-gray-100">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Workspace images */}
          <motion.div
            className="lg:col-span-6 relative hidden md:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            <div className="relative h-[520px]">

              <div className="absolute top-0 right-0 w-[78%] h-[420px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/80">
                <Image
                  src="/workspace-1.jpg"
                  alt="Clean workspace setup"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <motion.div
                className="absolute bottom-0 left-0 w-[48%] h-[260px] rounded-2xl overflow-hidden shadow-xl shadow-gray-200/60 border-4 border-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
              >
                <Image
                  src="/workspace-2.jpg"
                  alt="Another workspace setup"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                className="absolute top-6 left-0 z-20 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">4.9/5</p>
                  <p className="text-[10px] text-gray-400">50+ happy clients</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-[160px] right-4 z-20 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.85 }}
              >
                <MapPin size={13} className="text-blue-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-700">Ibadan, Nigeria</span>
              </motion.div>

              <motion.div
                className="absolute bottom-6 right-4 z-20 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 1 }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-700">24 products in stock</span>
              </motion.div>

              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}