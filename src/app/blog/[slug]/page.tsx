import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

async function getPost(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cms/posts/${slug}`, {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    return json.success ? json.data.post : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords?.join(", "),
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#1a0505]">
      <div className="blob-bg" />
      <div className="page-wrapper max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors mb-8">
          <ChevronLeft size={16} /> Back to Blog
        </Link>

        {/* Cover */}
        {post.coverImageUrl && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 border border-white/10">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          {post.type !== "BLOG" && (
            <span className="badge-gold text-xs mb-4 inline-block">{post.type.replace(/_/g, " ")}</span>
          )}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-white/60 text-lg leading-relaxed italic">{post.excerpt}</p>}

          <div className="flex items-center gap-4 mt-5 flex-wrap">
            <span className="text-white/40 text-sm">{post.author?.name}</span>
            {post.publishedAt && (
              <span className="text-white/30 text-sm flex items-center gap-1">
                <Calendar size={13} />
                {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs text-white/50 bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-full flex items-center gap-1">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <hr className="divider-gold" />

        {/* Content */}
        <div
          className="prose prose-invert prose-gold max-w-none mt-8 text-white/75 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <hr className="divider-gold mt-12" />

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/blog" className="badge-glass inline-flex items-center gap-1.5 text-sm hover:text-white transition-colors">
            <ChevronLeft size={14} /> More Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
