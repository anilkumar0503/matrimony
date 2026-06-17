import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Heart, ArrowRight, Trophy, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const community = await prisma.community.findUnique({ where: { slug, isActive: true } });
  if (!community) return { title: "Community Not Found" };
  return {
    title: community.metaTitle || `${community.name} — Jasmine Matrimony`,
    description: community.metaDesc || community.description || `Join the ${community.name} community on Jasmine Matrimony.`,
  };
}

export default async function CommunitySlugPage({ params }: Props) {
  const { slug } = await params;

  const community = await prisma.community.findUnique({
    where: { slug, isActive: true },
    include: {
      _count: { select: { members: { where: { status: "APPROVED" } } } },
      successStories: {
        where: { status: "PUBLISHED" },
        take: 3,
        orderBy: { createdAt: "desc" },
      },
      announcements: {
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!community) notFound();

  const approvedMembersCount = community._count.members;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {community.banner && (
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-8">
              <img src={community.banner} alt={community.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {community.logo && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[rgba(201,151,44,0.3)] shrink-0">
                <img src={community.logo} alt={community.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {community.category && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[rgba(201,151,44,0.1)] border border-[rgba(201,151,44,0.2)] text-[#C9972C] text-xs">
                    {community.category}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{community.name}</h1>
              {community.description && (
                <p className="text-white/60 leading-relaxed">{community.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Users size={14} /> {approvedMembersCount.toLocaleString()} members
                </div>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/register"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C9972C] hover:bg-[#B8861B] text-[#1a0505] font-semibold rounded-xl transition-colors text-sm"
              >
                <Heart size={14} /> Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {community.announcements.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-[#C9972C]" /> Announcements
            </h2>
            <div className="space-y-3">
              {community.announcements.map((ann) => (
                <div key={ann.id} className="glass rounded-xl p-4">
                  <div className="text-white font-medium text-sm mb-1">{ann.title}</div>
                  <div className="text-white/60 text-sm">{ann.content}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Success Stories */}
      {community.successStories.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-[#C9972C]" /> Success Stories from {community.name}
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {community.successStories.map((story) => (
                <div key={story.id} className="glass rounded-2xl overflow-hidden">
                  {story.photo && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={story.photo} alt={story.coupleNames || "Success Story"} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    {story.coupleNames && (
                      <div className="text-white font-semibold text-sm mb-2">{story.coupleNames}</div>
                    )}
                    <p className="text-white/60 text-xs leading-relaxed line-clamp-3">{story.story}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/success-stories" className="inline-flex items-center gap-2 text-[#C9972C] hover:text-[#E8C76A] text-sm transition-colors">
                View all success stories <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Register CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-8 text-center border border-[rgba(201,151,44,0.15)]">
          <Heart size={32} className="text-[#C9972C] mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            Find Your Match in the {community.name} Community
          </h2>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            Join {approvedMembersCount.toLocaleString()}+ verified members from {community.name}. Register today and discover your perfect match within your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-3 bg-[#C9972C] hover:bg-[#B8861B] text-[#1a0505] font-semibold rounded-xl transition-colors">
              Create Free Profile
            </Link>
            <Link href="/search" className="px-8 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl transition-colors border border-white/[0.1]">
              Browse Profiles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
