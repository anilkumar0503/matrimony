"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Shield, Image, CreditCard, Settings,
  LogOut, Menu, X, Heart, FileText, BarChart3, Bell, Users2,
  BookOpen, Ticket, ChevronDown, ScrollText, KeyRound, Tag, MessageSquare
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
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
      { href: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
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
      { href: "/admin/coupons", icon: Tag, label: "Coupons" },
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
      { href: "/admin/admin-users", icon: Shield, label: "Admin Users" },
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

    // Intercept ALL fetch calls — redirect to login on any /api/admin 401
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const url = typeof args[0] === "string" ? args[0] : args[0] instanceof URL ? args[0].toString() : args[0] instanceof Request ? args[0].url : "";
        if (url.includes("/api/admin/")) {
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("adminRefreshToken");
          localStorage.removeItem("adminInfo");
          window.location.replace("/admin/login");
        }
      }
      return response;
    };

    return () => { window.fetch = originalFetch; };
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
    <div className="min-h-screen w-full flex bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-60 z-50 transition-transform duration-300 flex flex-col",
          "border-r border-border rounded-none",
          "bg-gradient-to-b from-background to-surface",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Jasmine Matrimony" className="h-9 w-auto" />
            <span className="text-foreground text-xs font-bold">Admin Panel</span>
          </Link>
          <button className="lg:hidden text-muted" onClick={() => setSidebarOpen(false)}>
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
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-muted rounded"
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
                          : "text-muted hover:text-foreground hover:bg-white/[0.04]"
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
        <div className="p-3 border-t border-border">
          {adminInfo && (
            <div className="px-3 py-2 mb-2">
              <div className="text-xs font-medium text-muted">{adminInfo.name}</div>
              <div className="text-[10px] text-muted">{adminInfo.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors w-full"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 w-full flex flex-col overflow-hidden lg:ml-60">
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center border-b border-border bg-background/80 backdrop-blur-xl">
          <button className="lg:hidden text-muted hover:text-foreground mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <span className="text-muted text-xs">Admin</span>
          <span className="text-muted mx-2 text-xs">/</span>
          <span className="text-muted text-xs capitalize">{pathname.split("/").slice(-1)[0]?.replace(/-/g, " ")}</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 w-full p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
