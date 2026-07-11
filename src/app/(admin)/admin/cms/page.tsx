"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  BookOpen, PlusCircle, Pencil, Trash2, Eye, X,
  ChevronLeft, ChevronRight, Globe, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  excerpt: string | null;
  publishedAt: string | null;
  author: { name: string };
  viewCount?: number;
}

const POST_TYPES = ["", "BLOG", "SUCCESS_STORY", "PAGE", "ANNOUNCEMENT"];
const POST_STATUSES = ["PUBLISHED", "DRAFT", "ARCHIVED"];

export default function AdminCmsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PUBLISHED");
  const [typeFilter, setTypeFilter] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");

  const form = useForm<{
    title: string; type: string; excerpt: string;
    coverImageUrl: string; tags: string; status: string;
    seoTitle: string; seoDescription: string;
  }>({ defaultValues: { type: "BLOG", status: "DRAFT" } });

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status: statusFilter });
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/cms/posts?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) { setPosts(json.data.posts); setTotal(json.data.pagination.total); }
    setLoading(false);
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditSlug(null);
    form.reset({ type: "BLOG", status: "DRAFT" });
    setContent("");
    setShowEditor(true);
  };

  const openEdit = async (slug: string) => {
    const res = await fetch(`/api/cms/posts/${slug}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      const p = json.data.post;
      form.reset({
        title: p.title, type: p.type, excerpt: p.excerpt || "",
        coverImageUrl: p.coverImageUrl || "", tags: p.tags.join(", "),
        status: p.status, seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "",
      });
      setContent(p.content || "");
      setEditSlug(slug);
      setShowEditor(true);
    }
  };

  const onSave = async (data: Record<string, string>) => {
    setSaving(true);
    const payload = {
      ...data,
      content,
      tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      seoKeywords: [],
    };

    let res;
    if (editSlug) {
      res = await fetch(`/api/cms/posts/${editSlug}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/cms/posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    if ((await res.json()).success) { setShowEditor(false); fetchPosts(); }
  };

  const deletePost = async (slug: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/cms/posts/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    fetchPosts();
  };

  const totalPages = Math.ceil(total / 10);
  const typeColor: Record<string, "gold" | "info" | "success" | "glass"> = {
    BLOG: "info", SUCCESS_STORY: "gold", PAGE: "glass", ANNOUNCEMENT: "success",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={22} className="text-[#f78222]" /> CMS & Content
          </h1>
          <p className="text-muted text-sm">{total} posts</p>
        </div>
        <Button variant="gold" onClick={openCreate}><PlusCircle size={16} /> New Post</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {POST_STATUSES.map((s) => (
          <Button key={s} variant={statusFilter === s ? "gold" : "glass"} size="sm"
            onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s}
          </Button>
        ))}
        <select className="input-glass w-40 text-sm" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          {POST_TYPES.map((t) => <option key={t} value={t}>{t || "All Types"}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Title", "Type", "Status", "Author", "Published", "Views", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-muted text-xs font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-24" /></td>)}
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">No posts found</td></tr>
            ) : posts.map((post) => (
              <tr key={post.id} className="border-b border-border hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground text-sm">{post.title}</div>
                  <div className="text-muted text-xs">/blog/{post.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={typeColor[post.type] || "glass"} className="text-[10px]">
                    {post.type.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={post.status === "PUBLISHED" ? "success" : post.status === "DRAFT" ? "warning" : "glass"}>
                    {post.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{post.author.name}</td>
                <td className="px-4 py-3 text-muted text-xs">{post.publishedAt ? formatDate(post.publishedAt) : "—"}</td>
                <td className="px-4 py-3 text-muted text-xs">{post.viewCount || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {post.status === "PUBLISHED" && (
                      <Button variant="ghost" size="icon" asChild title="View">
                        <a href={`/blog/${post.slug}`} target="_blank"><Eye size={14} /></a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post.slug)} title="Edit">
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => deletePost(post.slug)} title="Delete">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-muted text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="glass" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
              <Button variant="glass" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex items-start justify-center p-4 pt-8" onClick={() => setShowEditor(false)}>
          <div className="glass-dark rounded-2xl p-6 max-w-3xl w-full my-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                <FileText size={18} className="text-[#f78222]" />
                {editSlug ? "Edit Post" : "New Post"}
              </h3>
              <button onClick={() => setShowEditor(false)} className="text-muted hover:text-foreground"><X size={20} /></button>
            </div>

            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Title" placeholder="Post title" {...form.register("title", { required: "Title required" })}
                    error={form.formState.errors.title?.message} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Post Type</label>
                  <select className="input-glass" {...form.register("type")}>
                    {POST_TYPES.slice(1).map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
                  <select className="input-glass" {...form.register("status")}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Content (Markdown / HTML)</label>
                <textarea
                  className="input-glass min-h-[250px] font-mono text-xs"
                  placeholder="Write your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <Input label="Excerpt" placeholder="Short description (max 500 chars)" {...form.register("excerpt")} />
              <Input label="Cover Image URL" placeholder="https://..." {...form.register("coverImageUrl")} />
              <Input label="Tags (comma separated)" placeholder="wedding, tips, success" {...form.register("tags")} />

              <hr className="border-border" />
              <div className="text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Globe size={12} /> SEO
              </div>
              <Input label="SEO Title (max 70)" placeholder="Optimized title" {...form.register("seoTitle")} />
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">SEO Description (max 160)</label>
                <textarea className="input-glass" maxLength={160} rows={2} placeholder="Meta description" {...form.register("seoDescription")} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="glass" type="button" onClick={() => setShowEditor(false)} className="flex-1">Cancel</Button>
                <Button variant="gold" type="submit" loading={saving} className="flex-1">
                  {editSlug ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
