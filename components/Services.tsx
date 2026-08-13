"use client";

import { motion } from "framer-motion";
import { Monitor, Gamepad2, Layout, FlaskConical, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  {
    icon: Monitor,
    title: "Workspace Optimization",
    desc: "Home office & business setup planning built around how you actually work.",
    href: "/#contact",
  },
  {
    icon: Gamepad2,
    title: "Gaming Station Builds",
    desc: "Budget to premium gaming configurations. No upselling, just what you need.",
    href: "/shop",
  },
  {
    icon: Layout,
    title: "Desk Setup Consultation",
    desc: "Ergonomics, monitor placement, cable management — the details that matter.",
    href: "/#contact",
  },
  {
    icon: FlaskConical,
    title: "Product Testing & Reviews",
    desc: "Real-world testing over weeks, not days. Honest pros and cons, always.",
    href: "/blog",
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

export default function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-white">
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
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">What We Do</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Services</h2>
          <p className="text-gray-500 max-w-xl">
            Every service is built around one principle: give you exactly what you need, nothing more.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                variants={item}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-500 transition-colors">
                  <Icon size={18} className="text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-blue-500 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {s.desc}
                </p>
                <Link href={s.href} className="flex items-center gap-1 text-xs font-semibold text-blue-500 mt-5">
                  Learn More <ArrowUpRight size={12} />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}