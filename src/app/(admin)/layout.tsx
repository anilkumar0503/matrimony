"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Shield, Image, CreditCard, Settings,
  LogOut, Menu, X, Heart, FileText, BarChart3, Bell, Users2,
  BookOpen, Ticket, ChevronDown, ScrollText, KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Member Management",
    items: [
      { href: "/admin/users", icon: Users, label: "Members" },
      { href: "/admin/kyc", icon: Shield, label: "KYC Queue" },
      { href: "/admin/images", icon: Image, label: "Image Moderation" },
    ],
  },
  {
    label: "Matching",
    items: [{ href: "/admin/match-tickets", icon: Ticket, label: "Match Tickets" }],
  },
  {
    label: "Revenue",
    items: [
      { href: "/admin/subscription-plans", icon: CreditCard, label: "Subscription Plans" },
      { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
      { href: "/admin/payments", icon: BarChart3, label: "Payments" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/communities", icon: Users2, label: "Communities" },
      { href: "/admin/cms", icon: BookOpen, label: "CMS" },
      { href: "/admin/notifications", icon: Bell, label: "Notifications" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/roles", icon: KeyRound, label: "Roles & Permissions" },
      { href: "/admin/settings", icon: Settings, label: "Platform Settings" },
      { href: "/admin/audit-logs", icon: ScrollText, label: "Audit Logs" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ name: string; role: string } | null>(null);
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("adminAccessToken");
    if (!token && pathname !== "/admin/login") { window.location.replace("/admin/login"); return; }
    const info = localStorage.getItem("adminInfo");
    if (info) setAdminInfo(JSON.parse(info));

    // Handle 401 errors from API calls
    const handle401 = (event: MessageEvent) => {
      if (event.data === 'ADMIN_401') {
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminInfo");
        window.location.replace("/admin/login");
      }
    };

    window.addEventListener('message', handle401);
    return () => window.removeEventListener('message', handle401);
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  const logout = () => {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminInfo");
    window.location.replace("/admin/login");
  };

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0f0303]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-60 z-50 transition-transform duration-300 flex flex-col",
          "border-r border-white/[0.06] rounded-none",
          "bg-gradient-to-b from-[#1a0505] to-[#0f0202]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7B1D1D] to-[#C9972C] flex items-center justify-center">
              <Heart size={12} className="text-white fill-white" />
            </div>
            <span className="text-white text-xs font-bold">Admin Panel</span>
          </Link>
          <button className="lg:hidden text-white/40" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navGroups.map((group) => {
            const isCollapsed = collapsed.includes(group.label);
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30 hover:text-white/50 rounded"
                >
                  {group.label}
                  <ChevronDown size={12} className={cn("transition-transform", isCollapsed && "-rotate-90")} />
                </button>
                {!isCollapsed && group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-[rgba(201,151,44,0.12)] text-[#E8C76A] border border-[rgba(201,151,44,0.15)]"
                          : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      <item.icon size={15} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="p-3 border-t border-white/[0.06]">
          {adminInfo && (
            <div className="px-3 py-2 mb-2">
              <div className="text-xs font-medium text-white/80">{adminInfo.name}</div>
              <div className="text-[10px] text-white/30">{adminInfo.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 w-full flex flex-col overflow-hidden lg:ml-60">
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center border-b border-white/[0.06] bg-[#0f0303]/80 backdrop-blur-xl">
          <button className="lg:hidden text-white/50 hover:text-white mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <span className="text-white/30 text-xs">Admin</span>
          <span className="text-white/20 mx-2 text-xs">/</span>
          <span className="text-white/70 text-xs capitalize">{pathname.split("/").slice(-1)[0]?.replace(/-/g, " ")}</span>
        </header>
        <main className="flex-1 w-full p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
