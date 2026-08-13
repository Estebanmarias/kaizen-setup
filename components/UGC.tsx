"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const FEATURED = [
  { id: "RGiARTrAyWQ", title: "Wireless AirTag Dual Review", creator: "XY Shot" },
  { id: "TX1Da_AgwhM", title: "G30LD Ergonomic Mouse Review", creator: "XY Shot" },
  { id: "Do3WCajmfXY", title: "CX23 Mechanical Keyboard Unboxing", creator: "XY Shot" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function YoutubeEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden aspect-video bg-gray-900 relative group cursor-pointer"
      onClick={() => setPlaying(true)}
    >
      {playing ? (
        <iframe className="w-full h-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      ) : (
        <>
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play size={22} className="text-white ml-1" fill="white" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function UGC() {
  return (
    <section id="ugc" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">In The Wild</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What Creators Are Saying</h2>
              <p className="text-gray-500 max-w-xl">
                Real reviews and unboxings from creators who've tested our products firsthand.
              </p>
            </div>
            <Link href="/ugc"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:underline flex-shrink-0 ml-8">
              See All <ArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURED.map((v) => (
            <motion.div key={v.id} variants={item}>
              <YoutubeEmbed id={v.id} title={v.title} />
              <div className="mt-3 px-1">
                <p className="font-bold text-sm text-gray-900">{v.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">by {v.creator}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 sm:hidden">
          <Link href="/ugc" className="text-sm font-semibold text-blue-500 hover:underline">
            See All Creator Reviews →
          </Link>
        </div>
      </div>
    </section>
  );
}