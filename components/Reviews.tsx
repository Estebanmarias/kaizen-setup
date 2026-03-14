const REVIEWS = [
  {
    tag: "Budget Pick",
    title: "Wireless Tag Dual Tracker",
    summary:
      "A $10–15 tracker that punches above its weight. Full breakdown of real-world performance after weeks of use.",
    link: "https://medium.com/@kaizensetup.ng/the-20-tracker-that-works-with-both-iphone-and-android-we-tested-it-ac4aa6ebb6a6",
  },
  {
    tag: "Recommended",
    title: "Logitech MX Master 4",
    summary:
      "The productivity mouse everyone talks about — but does it justify the price in Nigeria?",
    link: "https://medium.com/@kaizensetup.ng/logitech-mx-master-4-review-is-the-new-action-ring-worth-120-44c5759c109e",
  },
  {
    tag: "Guide",
    title: "Snapchat Storage Update",
    summary:
      "What changed, why it matters, and how to manage your storage smartly going forward.",
    link: "https://medium.com/@kaizensetup.ng/snapchat-ends-unlimited-memories-storage-what-you-need-to-know-521716223f3f",
  },
  {
    tag: "Tested",
    title: "EDC Breakdown",
    summary:
      "KaizenSetup's personal everyday carry — practical gear for Nigerian tech users who move a lot.",
    link: "https://medium.com/@kaizensetup.ng/my-everyday-carry-whats-in-my-tech-bag-2026-setup-eec97c5bdd17",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 px-6 bg-white dark:bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          Tested & Reviewed
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Featured Reviews
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          Weeks of real use. Honest findings. No affiliate pressure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((r, index) => (
            <div key={r.title}
              data-aos="fade-left"
              data-aos-delay={index * 150}
              className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-gray-900 dark:hover:border-white transition-colors flex flex-col group">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-4 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {r.tag}
              </span>
              <h3 className="font-semibold text-base mb-2 text-gray-900 dark:text-white">
                {r.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed flex-1">
                {r.summary}
              </p>
              <a href={r.link} target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-500 group-hover:underline">
                Read More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}