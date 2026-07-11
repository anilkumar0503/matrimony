"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Heart, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateAge, cmToFeetInches } from "@/lib/utils";

interface WishlistItem {
  id: string;
  userId: string;
  profileId: string;
  createdAt: string;
  profile: {
    id: string;
    gender: string;
    dateOfBirth: string;
    profile: { fullName: string; city: string; state: string; religion: string; height: number | null } | null;
    isKycVerified?: boolean;
    images: { originalUrl: string; watermarkedUrl: string | null; isPrimary: boolean }[];
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);

  const token = () => localStorage.getItem("accessToken");

  const fetchWishlist = async () => {
    const res = await fetch("/api/user/wishlist", { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) setItems(json.data.wishlist);
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const remove = async (profileId: string) => {
    setRemoving(profileId);
    const res = await fetch(`/api/user/wishlist?profileId=${profileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if ((await res.json()).success) setItems((prev) => prev.filter((i) => i.profileId !== profileId));
    setRemoving(null);
  };

  const sendInterest = async (profileId: string) => {
    setSendingInterest(profileId);
    try {
      await fetch("/api/user/interests", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profileId }),
      });
    } finally {
      setSendingInterest(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
          <Star size={22} className="text-[#f78222]" /> Wishlist
        </h1>
        <p className="text-muted text-sm">{items.length} saved profiles</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass p-16 text-center">
          <Star size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted">Your wishlist is empty</p>
          <p className="text-muted text-sm mt-1">Browse profiles and save the ones you like</p>
          <Button variant="gold" size="sm" asChild className="mt-4">
            <Link href="/dashboard/search">Browse Profiles</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const p = item.profile;
            if (!p) return null;
            const prof = p.profile;
            const photo = p.images.find((i) => i.isPrimary) || p.images[0];
            return (
              <div key={item.id} className="glass p-4 flex items-start gap-4">
                {/* Photo */}
                <Link href={`/profile/${p.id}`} className="shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[rgba(201,151,44,0.1)]">
                    {photo ? (
                      <img src={photo.watermarkedUrl || photo.originalUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#f78222] font-bold text-xl">
                        {prof?.fullName?.[0] || "?"}
                      </div>
                    )}
                  </div>
                </Link>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${p.id}`}>
                    <div className="font-medium text-foreground text-sm hover:text-[#E8C76A] transition-colors">{prof?.fullName || "—"}</div>
                  </Link>
                  <div className="text-muted text-xs mt-0.5">
                    {p.dateOfBirth ? calculateAge(p.dateOfBirth) + " yrs" : ""}
                    {prof?.height ? ` · ${cmToFeetInches(prof.height)}` : ""}
                  </div>
                  <div className="text-muted text-xs mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {prof?.city}, {prof?.state}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="gold" size="sm" className="text-xs h-7" onClick={() => sendInterest(p.id)} disabled={sendingInterest === p.id} loading={sendingInterest === p.id}>
                      <Heart size={11} /> Interest
                    </Button>
                    <Button variant="glass" size="sm" className="text-xs h-7 text-red-400" onClick={() => remove(p.id)} loading={removing === p.id}>
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
