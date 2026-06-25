"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Users2, PlusCircle, Pencil, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  logo: string | null;
  banner: string | null;
  _count: { members: number };
}

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<{
    name: string; description: string; category: string;
    logo: string; banner: string; isActive: boolean;
  }>({ defaultValues: { isActive: true } });

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/communities", { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) setCommunities(json.data.communities);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  const openCreate = () => {
    setEditId(null);
    form.reset({ isActive: true });
    setShowEditor(true);
  };

  const openEdit = (c: Community) => {
    setEditId(c.id);
    form.reset({
      name: c.name, description: c.description || "",
      category: c.category || "", logo: c.logo || "",
      banner: c.banner || "", isActive: c.isActive,
    });
    setShowEditor(true);
  };

  const onSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    const url = editId ? `/api/admin/communities/${editId}` : "/api/admin/communities";
    const method = editId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setShowEditor(false);
    fetchCommunities();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/communities/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    });
    fetchCommunities();
  };


  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Users2 size={22} className="text-[#C9972C]" /> Communities
          </h1>
          <p className="text-muted text-sm">{communities.length} communities</p>
        </div>
        <Button variant="gold" onClick={openCreate}><PlusCircle size={16} /> New Community</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
      ) : communities.length === 0 ? (
        <div className="glass p-12 text-center text-muted">No communities yet</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {communities.map((c) => {
            return (
              <div key={c.id} className="glass p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-foreground">{c.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {c.category && <Badge variant="glass" className="text-[10px]">{c.category}</Badge>}
                      {!c.isActive && <Badge variant="danger" className="text-[10px]">Inactive</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" className={c.isActive ? "text-amber-400" : "text-emerald-400"}
                      onClick={() => toggleActive(c.id, c.isActive)}>
                      {c.isActive ? <X size={14} /> : <CheckCircle size={14} />}
                    </Button>
                  </div>
                </div>
                {c.description && <p className="text-muted text-xs mb-3 line-clamp-2">{c.description}</p>}
                <div className="text-muted text-xs">{c._count.members} members</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowEditor(false)}>
          <div className="glass-dark p-6 rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">{editId ? "Edit Community" : "New Community"}</h3>
              <button onClick={() => setShowEditor(false)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>

            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
              <Input label="Community Name" {...form.register("name", { required: "Name required" })}
                error={form.formState.errors.name?.message} />
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
                <textarea className="input-glass" rows={3} {...form.register("description")} />
              </div>
              <Input label="Category (e.g. Caste, Region, Language)" placeholder="e.g. Tamil Brahmin" {...form.register("category")} />
              <Input label="Logo URL (optional)" placeholder="https://..." {...form.register("logo")} />
              <Input label="Banner URL (optional)" placeholder="https://..." {...form.register("banner")} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#C9972C]" {...form.register("isActive")} />
                <span className="text-muted text-sm">Active (visible to members)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button variant="glass" type="button" onClick={() => setShowEditor(false)} className="flex-1">Cancel</Button>
                <Button variant="gold" type="submit" loading={saving} className="flex-1">
                  {editId ? "Update" : "Create"} Community
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
