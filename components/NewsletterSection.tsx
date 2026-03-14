"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setStatus("success"); setEmail(""); }
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 px-6 bg-gray-900 border-t border-gray-800">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
          Stay in the Loop
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Get Setup Tips Straight to Your Inbox
        </h2>
        <p className="text-gray-400 mb-8">
          Honest reviews, setup guides, and deals — no spam, no fluff. Just useful tech content for the Nigerian market.
        </p>

        {status === "success" ? (
          <div className="text-green-400 font-medium text-lg">✅ You're in! We'll be in touch.</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-400 text-sm mt-3">Something went wrong. Try again.</p>
        )}
        <p className="text-gray-600 text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}