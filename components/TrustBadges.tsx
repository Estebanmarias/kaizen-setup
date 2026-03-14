import { ShieldCheck, BadgeCheck, MessageCircle, Truck, RefreshCw } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: BadgeCheck,  label: "Verified Suppliers" },
  { icon: MessageCircle, label: "24hr WhatsApp Support" },
  { icon: Truck,       label: "Nationwide Delivery" },
  { icon: RefreshCw,   label: "Easy Returns" },
];

export default function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 py-3 border-t border-gray-100 mt-3">
      {BADGES.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon size={13} className="text-blue-500 flex-shrink-0" />
          <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}