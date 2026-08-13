"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Consultation",
    desc: "Remote or in-person in Ibadan. We understand your needs, budget, and workflow before recommending anything.",
  },
  {
    n: "02",
    title: "Custom Recommendation",
    desc: "A tailored setup plan built around you — no generic lists, no sponsored picks, no upselling.",
  },
  {
    n: "03",
    title: "Product Sourcing",
    desc: "We connect you with trusted Nigerian suppliers at fair prices. No middleman markup.",
  },
  {
    n: "04",
    title: "Setup Optimization",
    desc: "Final configuration, cable management, and ergonomics dialled in. You just show up and work.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HowItWorks() {
  return (
    <section id="guides" className="py-24 px-6 bg-gray-50">
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
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">The Process</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
          <p className="text-gray-500 max-w-xl">
            No guesswork. No generic advice. A structured process from first call to final setup.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              variants={item}
              className="bg-white border border-gray-200 rounded-2xl p-6 relative hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-5 h-px bg-blue-200 z-10" />
              )}
              <span className="text-5xl font-black text-blue-500/20 select-none leading-none block mb-4">
                {s.n}
              </span>
              <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-blue-500 transition-colors">
                {s.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}