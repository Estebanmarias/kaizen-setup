"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const WA_URL = "https://wa.me/2347035378462?text=Hi%20KaizenSetup!%20I%27d%20like%20to%20know%20more%20about%20your%20products.";

export default function WhatsAppBubble() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const show = () => setHidden(false);
    const hide = () => setHidden(true);
    window.addEventListener("drawer_opened", hide);
    window.addEventListener("drawer_closed", show);
    return () => {
      window.removeEventListener("drawer_opened", hide);
      window.removeEventListener("drawer_closed", show);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 transition-opacity duration-200 ${hidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      {/* Tooltip */}
      <div className={`transition-all duration-200 ${hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"}`}>
        <div className="relative bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium px-4 py-2 rounded-xl shadow-lg whitespace-nowrap">
          Chat with us on WhatsApp
          <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white dark:border-l-[#1a1a1a]" />
        </div>
      </div>

      {/* Bubble */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: "#25D366" }}
        aria-label="Chat with us on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.428a.75.75 0 0 0 .916.916l5.579-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.945-1.355l-.355-.21-3.676.968.984-3.595-.229-.368A9.698 9.698 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
      </a>
    </div>
  );
}