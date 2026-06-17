"use client";
import { useEffect, useState, useCallback } from "react";
import { Tag, Plus, X, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: string;
  discountValue: number;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  minPurchase: number | null;
  isActive: boolean;
  createdAt: string;
  planMappings: { plan: { name: string } }[];
  _count: { usages: number };
}

interface Plan {
  id: string;
  name: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE", discountValue: "", usageLimit: "",
    validFrom: "", validUntil: "", minPurchase: "", planIds: [] as string[],
  });

  const token = () => localStorage.getItem("adminAccessToken");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (activeFilter) params.set("active", activeFilter);
    const res = await fetch(`/api/admin/coupons?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) { setCoupons(json.data.coupons); setTotal(json.data.pagination.total); }
    setLoading(false);
  }, [page, activeFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/admin/subscription-plans", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(j => { if (j.success) setPlans(j.data.plans || []); });
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    load();
  };

  const create = async () => {
    setCreating(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        discountValue: parseFloat(form.discountValue),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : undefined,
        planIds: form.planIds,
      }),
    });
    const json = await res.json();
    setCreating(false);
    if (json.success) {
      setShowCreate(false);
      setForm({ code: "", type: "PERCENTAGE", discountValue: "", usageLimit: "", validFrom: "", validUntil: "", minPurchase: "", planIds: [] });
      load();
    } else {
      alert(json.error || "Failed to create coupon");
    }
  };

  const totalPages = Math.ceil(total / 20);

  const discountLabel = (c: Coupon) => {
    if (c.type === "PERCENTAGE") return `${c.discountValue}% off`;
    if (c.type === "FLAT_INR") return `₹${c.discountValue} off`;
    if (c.type === "FREE_DAYS") return `${c.discountValue} free days`;
    return c.type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Tag size={22} className="text-[#C9972C]" /> Coupons
          </h1>
          <p className="text-white/40 text-sm">{total} coupons</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="gold" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Coupon</Button>
          {[{ label: "All", val: "" }, { label: "Active", val: "true" }, { label: "Inactive", val: "false" }].map(({ label, val }) => (
            <Button key={val} variant={activeFilter === val ? "gold" : "glass"} size="sm" onClick={() => { setActiveFilter(val); setPage(1); }}>{label}</Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-white/40 text-xs">
              <th className="text-left py-3 px-4">Code</th>
              <th className="text-left py-3 px-4">Discount</th>
              <th className="text-left py-3 px-4">Usage</th>
              <th className="text-left py-3 px-4">Valid Until</th>
              <th className="text-left py-3 px-4">Plans</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="skeleton h-8 rounded" /></td></tr>
              ))
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30">No coupons found</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="py-3 px-4">
                  <span className="font-mono text-[#C9972C] font-semibold text-xs bg-[rgba(201,151,44,0.1)] px-2 py-0.5 rounded">{c.code}</span>
                </td>
                <td className="py-3 px-4 text-white/80">{discountLabel(c)}</td>
                <td className="py-3 px-4 text-white/60">
                  {c._count.usages}{c.usageLimit ? `/${c.usageLimit}` : ""}
                  {c.usageLimit && c._count.usages >= c.usageLimit && (
                    <Badge variant="danger" className="ml-2 text-[10px]">Exhausted</Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-white/60 text-xs">{formatDate(c.validUntil)}</td>
                <td className="py-3 px-4 text-white/60 text-xs">
                  {c.planMappings.length === 0 ? "All plans" : c.planMappings.map(m => m.plan.name).join(", ")}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={c.isActive ? "success" : "glass"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleActive(c.id, c.isActive)} className="text-white/40 hover:text-white transition-colors">
                    {c.isActive ? <ToggleRight size={18} className="text-[#C9972C]" /> : <ToggleLeft size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="glass" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
          <span className="text-white/50 text-sm">Page {page} of {totalPages}</span>
          <Button variant="glass" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="glass-dark p-6 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Create Coupon</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Coupon Code *</label>
                  <input className="input-glass uppercase" placeholder="SAVE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Type *</label>
                  <select className="input-glass" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT_INR">Flat (₹)</option>
                    <option value="FREE_DAYS">Free Days</option>
                    <option value="COMMUNITY_SPECIFIC">Community Specific</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Discount Value *</label>
                  <input className="input-glass" type="number" placeholder={form.type === "PERCENTAGE" ? "20" : "500"} value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Usage Limit</label>
                  <input className="input-glass" type="number" placeholder="Unlimited" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Valid From *</label>
                  <input className="input-glass" type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Valid Until *</label>
                  <input className="input-glass" type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Minimum Purchase (₹)</label>
                <input className="input-glass" type="number" placeholder="0" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Applicable Plans (leave empty for all)</label>
                <div className="flex flex-wrap gap-2">
                  {plans.map(p => (
                    <label key={p.id} className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.planIds.includes(p.id)}
                        onChange={e => setForm(f => ({ ...f, planIds: e.target.checked ? [...f.planIds, p.id] : f.planIds.filter(id => id !== p.id) }))}
                        className="accent-[#C9972C]"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="glass" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                <Button variant="gold" onClick={create} loading={creating} disabled={!form.code || !form.discountValue || !form.validFrom || !form.validUntil} className="flex-1">Create Coupon</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
