"use client";
import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#1a0505] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="font-display text-[120px] font-bold text-red-900/20 leading-none select-none">500</div>
        <h1 className="font-display text-3xl font-bold text-foreground mt-2 mb-3">Something Went Wrong</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          An unexpected error occurred. Our team has been notified. Please try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[rgba(201,151,44,0.15)] border border-[rgba(201,151,44,0.3)] text-[#C9972C] rounded-xl text-sm font-medium hover:bg-[rgba(201,151,44,0.25)] transition-colors"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.05] border border-border text-muted rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-colors"
          >
            <Home size={16} /> Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
