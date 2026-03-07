"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const dismissed = sessionStorage.getItem("newsletter_dismissed");
    if (dismissed) return;

    // Don't show for logged-in users — they're already auto-subscribed
    supabase?.auth.getUser().then(({ data }) => {
      if (data.user) return;
      const timer = setTimeout(() => setVisible(true), 30000);
      return () => clearTimeout(timer);
    });
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("newsletter_dismissed", "true");
  };

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

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => dismiss(), 2500);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative z-10 w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <button onClick={dismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl">
          ✕
        </button>
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-2">Newsletter</p>
        <h3 className="text-2xl font-bold text-white mb-2">Want Better Setup Tips?</h3>
        <p className="text-gray-400 text-sm mb-6">
          Join our list for honest reviews and setup guides built for the Nigerian market.
        </p>
        {status === "success" ? (
          <div className="text-green-400 font-medium text-center py-4">✅ You're subscribed!</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address" required
              className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button type="submit" disabled={status === "loading"}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && <p className="text-red-400 text-sm mt-2">Something went wrong. Try again.</p>}
        <p className="text-gray-600 text-xs mt-4 text-center">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}