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
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-3">
          Trusted Suppliers
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Partners
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          Working with trusted Nigerian tech suppliers so you get fair prices
          and reliable products.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTNERS.map((p) => (
            <div
              key={p.handle}
              className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors group"
            >
              <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                {p.handle}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}