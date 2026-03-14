const PARTNERS = [
  { handle: "@mol_ng", desc: "Power banks & cables" },
  { handle: "@idamtechnology", desc: "Charging bricks & WiFi routers" },
  { handle: "@angivatech", desc: "Phones & earphones" },
  { handle: "@theebox26", desc: "NFC cards" },
];

export default function Partners() {
  return (
    <section className="py-20 px-6 bg-white dark:bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          Trusted Suppliers
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Partners
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          Working with trusted Nigerian tech suppliers so you get fair prices and reliable products.
        </p>

        <div className="relative overflow-hidden group">
          <div className="flex gap-6 animate-infinite-scroll hover:[animation-play-state:paused] w-max">
            {[...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, index) => (
              <div key={`${p.handle}-${index}`}
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors w-72 shrink-0">
                <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  {p.handle}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
          
          {/* Gradient Overlays for Fade Effect */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-[#0f0f0f] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-[#0f0f0f] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}