"use client";

import { useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function GoogleAnalyticsConsent() {
  const consent = typeof window !== "undefined"
    ? localStorage.getItem("cookie_consent")
    : null;

  if (consent !== "accepted") return null;

  return <GoogleAnalytics gaId="G-M13PZ1RESN" />;
}