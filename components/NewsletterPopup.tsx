"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const dismissed = sessionStorage.getItem("newsletter_dismissed");
    if (dismissed) return;
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
      if (res.ok) { setStatus("success"); setEmail(""); setTimeout(() => dismiss(), 2500); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative z-10 w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
        <button onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
          <X size={15} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">Newsletter</p>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Want Better Setup Tips?</h3>
        <p className="text-gray-500 text-sm mb-6">
          Honest reviews and setup guides built for the Nigerian market. No spam.
        </p>
        {status === "success" ? (
          <div className="text-green-600 font-medium text-center py-4 bg-green-50 rounded-2xl">
            ✅ You're subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
            <button type="submit" disabled={status === "loading"}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm">
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && <p className="text-red-500 text-sm mt-2">Something went wrong. Try again.</p>}
        <p className="text-gray-400 text-xs mt-4 text-center">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}