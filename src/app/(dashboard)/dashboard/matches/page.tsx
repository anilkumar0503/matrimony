"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Ticket, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, formatDate } from "@/lib/utils";

interface Match {
  id: string;
  createdAt: string;
  userA: { id: string; dateOfBirth: string; profile: { fullName: string; city: string } | null; images: { originalUrl: string; isPrimary: boolean }[] };
  userB: { id: string; dateOfBirth: string; profile: { fullName: string; city: string } | null; images: { originalUrl: string; isPrimary: boolean }[] };
  ticket: { id: string; status: string } | null;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);

  const token = () => localStorage.getItem("accessToken");

  useEffect(() => {
    const tkn = token();
    if (!tkn) return;
    const payload = JSON.parse(atob(tkn.split(".")[1]));
    setMyId(payload.sub);

    fetch("/api/user/matches", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.json())
      .then((json) => { if (json.success) setMatches(json.data.matches); })
      .finally(() => setLoading(false));
  }, []);

  const getOther = (match: Match) => {
    if (!myId) return match.userA;
    return match.userA.id === myId ? match.userB : match.userA;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
          <Heart size={22} className="text-[#C9972C] fill-[#C9972C]" /> Mutual Matches
        </h1>
        <p className="text-muted text-sm">{matches.length} mutual match{matches.length !== 1 ? "es" : ""}</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
      ) : matches.length === 0 ? (
        <div className="glass p-16 text-center">
          <Heart size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted">No mutual matches yet</p>
          <p className="text-muted text-sm mt-1">When someone accepts your interest and you accept theirs, it becomes a match!</p>
          <Button variant="gold" size="sm" asChild className="mt-4">
            <Link href="/dashboard/search">Find Profiles</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const other = getOther(match);
            const photo = other.images.find((i) => i.isPrimary) || other.images[0];
            return (
              <div key={match.id} className="glass p-5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[rgba(201,151,44,0.1)] shrink-0">
                  {photo ? (
                    <img src={photo.originalUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C9972C] font-bold text-xl">
                      {other.profile?.fullName?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{other.profile?.fullName || "—"}</span>
                    <CheckCircle size={14} className="text-emerald-400" />
                    <Badge variant="success" className="text-[10px]">Mutual Match</Badge>
                  </div>
                  <div className="text-muted text-xs mt-0.5">
                    {other.dateOfBirth ? calculateAge(other.dateOfBirth) + " yrs" : ""} · {other.profile?.city}
                  </div>
                  <div className="text-muted text-xs mt-0.5">Matched {formatDate(match.createdAt)}</div>
                  {match.ticket && (
                    <div className="mt-1">
                      <Badge variant="gold" className="text-[10px]">
                        <Ticket size={9} /> Admin Assistance: {match.ticket.status}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="gold" size="sm" asChild>
                    <Link href={`/profile/${other.id}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
