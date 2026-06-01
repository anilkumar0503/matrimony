"use client";
import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCheck, Heart, Shield, CreditCard, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface Notification {
  id: string;
  event: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

const eventIcon: Record<string, React.ElementType> = {
  interest_received: Heart,
  interest_accepted: Heart,
  mutual_match: Heart,
  kyc_approved: Shield,
  kyc_rejected: Shield,
  profile_approved: Shield,
  subscription_activated: CreditCard,
  payment_confirmed: CreditCard,
  payment_failed: CreditCard,
};

const eventColor: Record<string, string> = {
  interest_received: "text-pink-400 bg-pink-900/20",
  interest_accepted: "text-emerald-400 bg-emerald-900/20",
  mutual_match: "text-[#C9972C] bg-[rgba(201,151,44,0.1)]",
  kyc_approved: "text-emerald-400 bg-emerald-900/20",
  kyc_rejected: "text-red-400 bg-red-900/20",
  profile_approved: "text-emerald-400 bg-emerald-900/20",
  subscription_activated: "text-[#C9972C] bg-[rgba(201,151,44,0.1)]",
  payment_confirmed: "text-blue-400 bg-blue-900/20",
  payment_failed: "text-red-400 bg-red-900/20",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const token = () => localStorage.getItem("accessToken");

  const fetchNotifications = useCallback(async (p = 1) => {
    setLoading(true);
    const res = await fetch(`/api/user/notifications?page=${p}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const json = await res.json();
    if (json.success) {
      if (p === 1) setNotifications(json.data.notifications);
      else setNotifications((prev) => [...prev, ...json.data.notifications]);
      setUnreadCount(json.data.unreadCount);
      setTotal(json.data.pagination.total);
      setPage(p);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  };

  const markRead = async (id: string) => {
    setMarkingId(id);
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2 mb-1">
            <Bell size={22} className="text-[#C9972C]" /> Notifications
          </h1>
          <p className="text-white/40 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {total} total
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="glass-gold" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark All Read
          </Button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass p-16 text-center">
          <Bell size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No notifications yet</p>
          <p className="text-white/25 text-sm mt-1">You'll be notified about interests, matches, and important updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const eventKey = notif.event?.toLowerCase().replace(/ /g, "_");
            const Icon = eventIcon[eventKey] || Info;
            const colorClass = eventColor[eventKey] || "text-white/60 bg-white/5";

            return (
              <div
                key={notif.id}
                className={`glass p-4 flex items-start gap-4 cursor-pointer hover:border-white/15 transition-all
                  ${!notif.isRead ? "border-[rgba(201,151,44,0.2)] bg-[rgba(201,151,44,0.02)]" : ""}`}
                onClick={() => !notif.isRead && markRead(notif.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className={`text-sm font-medium ${!notif.isRead ? "text-white" : "text-white/80"}`}>
                        {notif.title || notif.event}
                      </div>
                      <div className="text-white/50 text-xs mt-0.5 leading-relaxed">{notif.body}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#C9972C]" />}
                      <span className="text-white/25 text-[10px]">{formatDateTime(notif.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {notifications.length < total && (
            <div className="text-center pt-2">
              <Button variant="glass" size="sm" onClick={() => fetchNotifications(page + 1)} loading={loading}>
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
