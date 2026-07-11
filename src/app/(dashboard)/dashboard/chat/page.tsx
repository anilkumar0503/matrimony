"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, formatDate } from "@/lib/utils";

interface Match {
  id: string;
  createdAt: string;
  userA: {
    id: string;
    dateOfBirth: string;
    profile: { fullName: string; city: string } | null;
    images: { originalUrl: string; isPrimary: boolean }[];
  };
  userB: {
    id: string;
    dateOfBirth: string;
    profile: { fullName: string; city: string } | null;
    images: { originalUrl: string; isPrimary: boolean }[];
  };
}

export default function ChatListPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [unreadPerMatch, setUnreadPerMatch] = useState<Record<string, number>>({});
  const [lastMessageAt, setLastMessageAt] = useState<Record<string, string>>({});

  const token = () => localStorage.getItem("accessToken");

  useEffect(() => {
    const tkn = token();
    if (!tkn) return;
    const payload = JSON.parse(atob(tkn.split(".")[1]));
    setMyId(payload.sub);

    fetch("/api/user/matches", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMatches(json.data.matches);
      })
      .finally(() => setLoading(false));

    fetch("/api/user/chat/unread", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUnreadPerMatch(json.data.perMatch);
          setLastMessageAt(json.data.lastMessageAt);
        }
      });
  }, []);

  const getOther = (match: Match) => {
    if (!myId) return match.userA;
    return match.userA.id === myId ? match.userB : match.userA;
  };

  const sortedMatches = [...matches].sort((a, b) => {
    const aUnread = (unreadPerMatch[a.id] || 0) > 0 ? 1 : 0;
    const bUnread = (unreadPerMatch[b.id] || 0) > 0 ? 1 : 0;
    if (bUnread !== aUnread) return bUnread - aUnread; // unread first

    const aTime = lastMessageAt[a.id] || a.createdAt;
    const bTime = lastMessageAt[b.id] || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime(); // most recent first
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
          <MessageCircle size={22} className="text-[#f78222]" /> Messages
        </h1>
        <p className="text-muted text-sm">Chat with your mutual matches</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="glass p-16 text-center">
          <MessageCircle size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted font-medium">No conversations yet</p>
          <p className="text-muted text-sm mt-1">
            Chat becomes available when both of you accept each other&apos;s interest.
          </p>
          <Button variant="gold" size="sm" asChild className="mt-4">
            <Link href="/dashboard/search">Find Profiles</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMatches.map((match) => {
            const other = getOther(match);
            const photo = other.images.find((i) => i.isPrimary) || other.images[0];
            const unread = unreadPerMatch[match.id] || 0;
            return (
              <Link
                key={match.id}
                href={`/dashboard/chat/${match.id}`}
                className={`glass p-4 flex items-center gap-4 hover:border-[rgba(201,151,44,0.3)] transition-colors group block ${unread > 0 ? "border-[rgba(201,151,44,0.25)] bg-[rgba(201,151,44,0.04)]" : ""}`}
              >
                {/* Avatar with unread dot */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[rgba(201,151,44,0.1)]">
                    {photo ? (
                      <img src={photo.originalUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#f78222] font-bold text-xl">
                        {other.profile?.fullName?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`group-hover:text-[#E8C76A] transition-colors truncate ${unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                      {other.profile?.fullName || "—"}
                    </span>
                    <Badge variant="success" className="text-[10px] shrink-0">
                      <Heart size={8} className="fill-current" /> Matched
                    </Badge>
                  </div>
                  <div className="text-muted text-xs mt-0.5">
                    {other.dateOfBirth ? calculateAge(other.dateOfBirth) + " yrs" : ""} · {other.profile?.city}
                  </div>
                  <div className={`text-xs mt-0.5 ${unread > 0 ? "text-emerald-400 font-medium" : "text-muted"}`}>
                    {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : `Matched ${formatDate(match.createdAt)}`}
                  </div>
                </div>

                <MessageCircle
                  size={18}
                  className={`shrink-0 transition-colors ${unread > 0 ? "text-emerald-400" : "text-muted group-hover:text-[#E8C76A]"}`}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
