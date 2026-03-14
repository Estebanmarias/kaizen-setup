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

export default function HowItWorks() {
  return (
    <section id="guides" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          The Process
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          How It Works
        </h2>
        <p className="text-gray-500 mb-12 max-w-xl">
          No guesswork. No generic advice. A structured process from first call to final setup.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n}
              className="bg-white border border-gray-200 rounded-xl p-6 relative hover:border-blue-500 transition-colors">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px bg-blue-500 opacity-40" />
              )}
              <span className="text-4xl font-black text-blue-500 opacity-30 select-none">{s.n}</span>
              <h3 className="font-semibold text-base mt-2 mb-2 text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}