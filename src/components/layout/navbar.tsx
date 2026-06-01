"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Find Match" },
  { href: "/plans", label: "Plans" },
  { href: "/communities", label: "Communities" },
  { href: "/blog", label: "Stories" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userInfo = localStorage.getItem("userInfo");
    setIsLoggedIn(!!token);
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUserName(parsed.fullName || parsed.name || parsed.firstName || "User");
      } catch {
        setUserName("User");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace("/");
  };

  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B1D1D] to-[#C9972C] flex items-center justify-center">
              <Heart size={16} className="text-white fill-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              Premium <span className="text-gold">Matrimony</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[#E8C76A] bg-[rgba(201,151,44,0.1)]"
                    : "text-white/70 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
                  <User size={16} />
                  {userName}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="gold" size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-white/[0.06] mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="divider-gold" />
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] flex items-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <User size={16} />
                    {userName}
                  </Link>
                  <Button variant="glass" size="sm" onClick={handleLogout} className="mx-4">
                    <LogOut size={16} className="mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <div className="flex gap-3 px-4 pt-2">
                  <Button variant="glass" size="sm" asChild className="flex-1">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="gold" size="sm" asChild className="flex-1">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
