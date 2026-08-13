"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const REVIEWS = [
  {
    tag: "Budget Pick",
    tagColor: "bg-green-50 text-green-600",
    title: "Wireless Tag Dual Tracker",
    summary: "A $10–15 tracker that punches above its weight. Full breakdown of real-world performance after weeks of use.",
    link: "https://medium.com/@kaizensetup.ng/the-20-tracker-that-works-with-both-iphone-and-android-we-tested-it-ac4aa6ebb6a6",
  },
  {
    tag: "Recommended",
    tagColor: "bg-blue-50 text-blue-600",
    title: "Logitech MX Master 4",
    summary: "The productivity mouse everyone talks about — but does it justify the price in Nigeria?",
    link: "https://medium.com/@kaizensetup.ng/logitech-mx-master-4-review-is-the-new-action-ring-worth-120-44c5759c109e",
  },
  {
    tag: "Guide",
    tagColor: "bg-purple-50 text-purple-600",
    title: "Snapchat Storage Update",
    summary: "What changed, why it matters, and how to manage your storage smartly going forward.",
    link: "https://medium.com/@kaizensetup.ng/snapchat-ends-unlimited-memories-storage-what-you-need-to-know-521716223f3f",
  },
  {
    tag: "Tested",
    tagColor: "bg-amber-50 text-amber-600",
    title: "EDC Breakdown",
    summary: "KaizenSetup's personal everyday carry — practical gear for Nigerian tech users who move a lot.",
    link: "https://medium.com/@kaizensetup.ng/my-everyday-carry-whats-in-my-tech-bag-2026-setup-eec97c5bdd17",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">Tested & Reviewed</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Featured Reviews</h2>
          <p className="text-gray-500 max-w-xl">
            Weeks of real use. Honest findings. No affiliate pressure.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {REVIEWS.map((r) => (
            <motion.a
              key={r.title}
              variants={item}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col group"
            >
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-4 ${r.tagColor}`}>
                {r.tag}
              </span>
              <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-blue-500 transition-colors flex-1">
                {r.title}
              </h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{r.summary}</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-500">
                Read More <ArrowUpRight size={12} />
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}