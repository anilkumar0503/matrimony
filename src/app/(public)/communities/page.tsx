import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const communities = await prisma.community.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 badge-gold mb-4">
          <Users size={13} /> Communities
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Find Your <span className="text-gold">Community</span>
        </h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Connect with others who share your background, values, and traditions. Join a community to enhance your matchmaking experience.
        </p>
      </div>

      {communities.length === 0 ? (
        <div className="glass p-8 text-center">
          <Users size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="font-display text-xl text-white mb-2">No Communities Yet</h3>
          <p className="text-white/50 text-sm">Communities will be listed here once they are created.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {communities.map((community) => (
            <div key={community.id} className="glass p-6 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {community.logo && (
                    <img
                      src={community.logo}
                      alt={community.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{community.name}</h3>
                    <Badge variant="glass" className="text-xs">{community.category}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-white/60 text-sm mb-4 line-clamp-2">{community.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/40 text-xs">
                  <Users size={14} />
                  <span>{community._count.members} members</span>
                </div>
                <Button variant="glass" size="sm" asChild>
                  <Link href={`/register?community=${community.id}`}>
                    Join <ChevronRight size={14} />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
