import Link from "next/link";
import { Heart, ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Success Stories",
  description: "Real couples who found their life partner on our premium matrimony platform.",
};

export default async function SuccessStoriesPage() {
  const stories = await prisma.successStory.findMany({
    orderBy: [{ isFeatured: "desc" }, { date: "desc" }],
    include: { community: { select: { name: true } } },
  });

  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <Heart size={13} className="fill-current" /> Real Couples
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Love Stories That <span className="text-gold">Inspire</span>
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Thousands of couples have found their perfect match through our platform. Here are just a few of their beautiful stories.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="glass p-16 text-center">
            <Heart size={40} className="text-[#f78222] mx-auto mb-4" />
            <p className="text-muted">Success stories coming soon. Be one of the first!</p>
            <Link href="/register" className="btn-gold mt-6 inline-block">Get Started</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {stories.map((story: typeof stories[number]) => (
              <div key={story.id} className={`glass p-6 ${story.isFeatured ? "ring-1 ring-[#f78222]/40" : ""}`}>
                <div className="flex items-start gap-4">
                  {story.photo ? (
                    <img src={story.photo} alt={story.coupleName}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-[#f78222]/30 shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7B1D1D] to-[#f78222] flex items-center justify-center shrink-0">
                      <Heart size={24} className="text-foreground fill-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-bold text-foreground">{story.coupleName}</h3>
                      {story.isFeatured && (
                        <span className="badge-gold text-[10px]">Featured</span>
                      )}
                    </div>
                    {story.community && (
                      <p className="text-[#f78222] text-xs mb-2">{story.community.name} Community</p>
                    )}
                    {story.date && (
                      <p className="text-muted text-xs mb-3">Married {formatDate(story.date)}</p>
                    )}
                    <p className="text-muted text-sm leading-relaxed line-clamp-4">{story.story}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 glass p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Your Story Could Be Next</h2>
          <p className="text-muted mb-6">Join thousands of verified members and find your perfect life partner.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-gold">Create Profile Free</Link>
            <Link href="/plans" className="btn-glass">View Premium Plans</Link>
          </div>
        </div>
      </div>
    </>
  );
}
