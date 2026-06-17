"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Heart, LayoutDashboard, User, Search, Star,
  Bell, CreditCard, Settings, LogOut, Menu, X, Shield, Users2, Images
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/gallery", icon: Images, label: "My Gallery" },
  { href: "/dashboard/search", icon: Search, label: "Find Match" },
  { href: "/dashboard/interests", icon: Heart, label: "Interests" },
  { href: "/dashboard/wishlist", icon: Star, label: "Wishlist" },
  { href: "/dashboard/matches", icon: Shield, label: "Matches" },
  { href: "/dashboard/communities", icon: Users2, label: "Communities" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/subscription", icon: CreditCard, label: "Subscription" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { window.location.replace("/login"); return; }
    setAuthed(true);

    fetch("/api/user/notifications?unreadOnly=true", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          localStorage.clear();
          window.location.replace("/login");
          return;
        }
        const data = await r.json();
        if (data.success) setUnreadCount(data.data.unreadCount);
      })
      .catch(() => {});
  }, []);

  const logout = () => {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    }).finally(() => {
      localStorage.clear();
      window.location.replace("/login");
    });
  };

  if (authed === null) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 z-50 transition-transform duration-300",
          "glass-dark border-r border-white/[0.06] rounded-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Jasmine Matrimony" className="h-15 w-auto" />
            </Link>
            <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[rgba(201,151,44,0.12)] text-[#E8C76A] border border-[rgba(201,151,44,0.2)]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  <item.icon size={17} />
                  {item.label}
                  {item.href === "/dashboard/notifications" && unreadCount > 0 && (
                    <span className="ml-auto bg-[#C9972C] text-[#1a0505] text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/[0.06]">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full"
            >
              <LogOut size={17} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-64">
        {/* Top bar */}
        <header className="navbar-glass sticky top-0 z-30 px-4 py-5 flex items-center justify-between">
          <button
            className="lg:hidden text-white/70 hover:text-white p-1.5"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="lg:hidden">
            <img src="/logo.png" alt="Jasmine Matrimony" className="h-15 w-auto" />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/dashboard/notifications" className="relative p-2 text-white/60 hover:text-white">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9972C] rounded-full" />
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
