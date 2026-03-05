"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Link from "next/link";

const FEATURED = [
  {
    id: "RGiARTrAyWQ",
    title: "Wireless AirTag Dual Review",
    creator: "XY Shot",
  },
  {
    id: "TX1Da_AgwhM",
    title: "G30LD Ergonomic Mouse Review",
    creator: "XY Shot",
  },
  {
    id: "Do3WCajmfXY",
    title: "CX23 Mechanical Keyboard Unboxing",
    creator: "XY Shot",
  },
];

function YoutubeEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden aspect-video bg-black relative group cursor-pointer"
      onClick={() => setPlaying(true)}
    >
      {playing ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={24} className="text-white ml-1" fill="white" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function UGC() {
  return (
    <section id="ugc" className="py-20 px-6 bg-gray-50 dark:bg-[#141414]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          In The Wild
        </p>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            What Creators Are Saying
          </h2>
          <Link
            href="/ugc"
            className="text-sm font-semibold text-blue-500 hover:underline hidden sm:block"
          >
            See All Creator Reviews →
          </Link>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          Real reviews and unboxings from creators who've tested our products firsthand.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((v) => (
            <div key={v.id}>
              <YoutubeEmbed id={v.id} title={v.title} />
              <div className="mt-3">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {v.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  by {v.creator}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/ugc" className="text-sm font-semibold text-blue-500 hover:underline">
            See All Creator Reviews →
          </Link>
        </div>
      </div>
    </section>
  );
}