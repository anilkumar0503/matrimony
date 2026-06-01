import Link from "next/link";
import { Heart } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="navbar-glass sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B1D1D] to-[#C9972C] flex items-center justify-center">
            <Heart size={14} className="text-white fill-white" />
          </div>
          <span className="font-display font-bold text-white text-sm">Premium Matrimony</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-white/50">
          <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
        </div>
      </nav>
      {children}
      <footer className="px-6 py-8 border-t border-white/[0.06] text-center text-white/30 text-xs">
        © {new Date().getFullYear()} Premium Matrimony. All rights reserved.
      </footer>
    </div>
  );
}
