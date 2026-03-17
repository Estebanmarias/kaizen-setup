import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Swapped to ArrowLeft

type BackLinkProps = {
  href?: string;
  label?: string;
};

export default function BackLink({ href = "/", label = "Back to Home" }: BackLinkProps) {
  return (
    <Link 
      href={href} 
      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline transition-colors"
    >
      <ArrowLeft size={14} /> {label}
    </Link>
  );
}