import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a0505] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="font-display text-[120px] font-bold text-[#C9972C]/20 leading-none select-none">404</div>
        <h1 className="font-display text-3xl font-bold text-foreground mt-2 mb-3">Page Not Found</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[rgba(201,151,44,0.15)] border border-[rgba(201,151,44,0.3)] text-[#C9972C] rounded-xl text-sm font-medium hover:bg-[rgba(201,151,44,0.25)] transition-colors"
          >
            <Home size={16} /> Go Home
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-muted rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            <Search size={16} /> Browse Profiles
          </Link>
        </div>
      </div>
    </div>
  );
}
