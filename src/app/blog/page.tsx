import Link from "next/link";
import { BookOpen, ArrowRight, Calendar, Tag } from "lucide-react";

async function getPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cms/posts?type=BLOG&limit=12`, {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    return json.success ? json.data : { posts: [], pagination: { total: 0 } };
  } catch {
    return { posts: [], pagination: { total: 0 } };
  }
}

export default async function BlogPage() {
  const data = await getPosts();
  const posts = data.posts || [];

  return (
    <div className="min-h-screen bg-[#1a0505]">
      <div className="blob-bg" />
      <div className="page-wrapper max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge-gold inline-flex items-center gap-1.5 mb-4"><BookOpen size={12} /> Blog & Articles</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Insights for Your <span className="shimmer-text">Matrimony Journey</span>
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Expert tips, wedding inspiration, success stories, and guidance for finding your perfect match.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="glass p-16 text-center text-muted">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            No articles published yet. Check back soon!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: {
              slug: string;
              coverImageUrl: string | null;
              type: string;
              publishedAt: string | null;
              title: string;
              excerpt: string | null;
              tags: string[];
              author: { name: string };
            }) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="glass overflow-hidden h-full flex flex-col hover:border-[rgba(201,151,44,0.25)] transition-colors p-0">
                  {/* Cover */}
                  <div className="aspect-video bg-gradient-to-br from-[#7B1D1D]/30 to-[#f78222]/10 overflow-hidden">
                    {post.coverImageUrl ? (
                      <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={32} className="text-muted" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {post.type !== "BLOG" && (
                        <span className="badge-gold text-[10px]">{post.type.replace(/_/g, " ")}</span>
                      )}
                      {post.publishedAt && (
                        <span className="text-muted text-xs flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-[#E8C76A] transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-muted text-sm leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-muted text-xs">{post.author?.name}</span>
                      <span className="text-[#f78222] text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more <ArrowRight size={12} />
                      </span>
                    </div>

                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] text-muted bg-white/[0.04] border border-border px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Tag size={8} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
