import Link from "next/link";
import { Heart } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="navbar-glass sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Jasmine Matrimony" className="h-15 w-auto" />
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted">
          <Link href="/privacy" className="hover:text-muted transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-muted transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-muted transition-colors">Contact</Link>
        </div>
      </nav>
      {children}
      <footer className="px-6 py-8 border-t border-border text-center text-muted text-xs">
        © {new Date().getFullYear()} Jasmine Matrimony. All rights reserved.
      </footer>
    </div>
  );
}
