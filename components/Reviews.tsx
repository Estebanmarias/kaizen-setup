const REVIEWS = [
  {
    tag: "Budget Pick",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    title: "Wireless Tag Dual Tracker",
    summary:
      "A $10–15 tracker that punches above its weight. Full breakdown of real-world performance after weeks of use.",
    link: "https://medium.com/@kaizensetup.ng",
  },
  {
    tag: "Recommended",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    title: "Logitech MX Master 4",
    summary:
      "The productivity mouse everyone talks about — but does it justify the price in Nigeria?",
    link: "https://medium.com/@kaizensetup.ng",
  },
  {
    tag: "Guide",
    tagColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    title: "Snapchat Storage Update",
    summary:
      "What changed, why it matters, and how to manage your storage smartly going forward.",
    link: "https://medium.com/@kaizensetup.ng",
  },
  {
    tag: "Tested",
    tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    title: "EDC Breakdown",
    summary:
      "KaizenSetup's personal everyday carry — practical gear for Nigerian tech users who move a lot.",
    link: "https://medium.com/@kaizensetup.ng",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 px-6 bg-white dark:bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-3">
          Tested & Reviewed
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Featured Reviews
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          Weeks of real use. Honest findings. No affiliate pressure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((r) => (
            <div
              key={r.title}
              className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors flex flex-col group"
            >
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-4 ${r.tagColor}`}
              >
                {r.tag}
              </span>
              <h3 className="font-semibold text-base mb-2 text-gray-900 dark:text-white">
                {r.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed flex-1">
                {r.summary}
              </p>
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-500 group-hover:underline"
              >
                Read More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}