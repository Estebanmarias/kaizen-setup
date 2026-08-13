"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cookie_consent") as "accepted" | "declined" | null;
    if (stored) {
      setConsent(stored);
    } else {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setConsent("accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setConsent("declined");
    setVisible(false);
  };

  return (
    <>
      {/* Only load GA4 if accepted */}
      {consent === "accepted" && <GoogleAnalytics gaId="G-M13PZ1RESN" />}

      {/* Banner */}
      {visible && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-[60]">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🍪</span>
              <p className="text-sm font-bold text-gray-900">We use cookies</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              We use cookies to analyse site traffic and improve your experience. See our{" "}
              <Link href="/privacy" className="text-blue-500 hover:underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={decline}
                className="flex-1 border border-gray-200 text-gray-600 hover:border-gray-400 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}