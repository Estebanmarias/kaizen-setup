import { Monitor, Gamepad2, Layout, FlaskConical } from "lucide-react";

const SERVICES = [
  {
    icon: Monitor,
    title: "Workspace Optimization",
    desc: "Home office & business setup planning built around how you actually work.",
  },
  {
    icon: Gamepad2,
    title: "Gaming Station Builds",
    desc: "Budget to premium gaming configurations. No upselling, just what you need.",
  },
  {
    icon: Layout,
    title: "Desk Setup Consultation",
    desc: "Ergonomics, monitor placement, cable management — the details that matter.",
  },
  {
    icon: FlaskConical,
    title: "Product Testing & Reviews",
    desc: "Real-world testing over weeks, not days. Honest pros and cons, always.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          What We Do
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          Services
        </h2>
        <p className="text-gray-500 mb-12 max-w-xl">
          Every service is built around one principle: give you exactly what you need, nothing more.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-900 transition-colors group">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-500" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-gray-900">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {s.desc}
                </p>
                <span className="text-xs font-semibold text-blue-500 group-hover:underline cursor-pointer">
                  Learn More →
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}