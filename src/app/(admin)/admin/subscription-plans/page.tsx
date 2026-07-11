"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, CreditCard, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  description: string | null;
  priceMonthly: number | null;
  priceQuarterly: number | null;
  priceYearly: number | null;
  durationDays: number | null;
  wishlistLimit: number | null;
  interestLimit: number | null;
  features: any;
  isActive: boolean;
  isDefault: boolean;
  communityId: string | null;
  community: { id: string; name: string } | null;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tier: "FREE",
    description: "",
    priceMonthly: "",
    priceQuarterly: "",
    priceYearly: "",
    durationDays: "",
    wishlistLimit: "",
    interestLimit: "",
    features: "",
    isActive: true,
  });

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/subscription-plans", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) {
        setPlans(json.data.plans);
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      tier: plan.tier,
      description: plan.description || "",
      priceMonthly: plan.priceMonthly?.toString() || "",
      priceQuarterly: plan.priceQuarterly?.toString() || "",
      priceYearly: plan.priceYearly?.toString() || "",
      durationDays: plan.durationDays?.toString() || "",
      wishlistLimit: plan.wishlistLimit?.toString() || "",
      interestLimit: plan.interestLimit?.toString() || "",
      features: Array.isArray(plan.features) ? plan.features.join(", ") : "",
      isActive: plan.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) {
        fetchPlans();
      } else {
        alert(json.error || "Failed to delete plan");
      }
    } catch (err) {
      console.error("Failed to delete plan:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    const payload = {
      ...formData,
      priceMonthly: formData.priceMonthly || null,
      priceQuarterly: formData.priceQuarterly || null,
      priceYearly: formData.priceYearly || null,
      durationDays: formData.durationDays || null,
      wishlistLimit: formData.wishlistLimit || null,
      interestLimit: formData.interestLimit || null,
      features: formData.features ? formData.features.split(",").map(f => f.trim()) : [],
    };

    try {
      const url = editingPlan 
        ? `/api/admin/subscription-plans/${editingPlan.id}`
        : "/api/admin/subscription-plans";
      
      const res = await fetch(url, {
        method: editingPlan ? "PUT" : "POST",
        headers: { 
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setEditingPlan(null);
        setFormData({
          name: "",
          tier: "FREE",
          description: "",
          priceMonthly: "",
          priceQuarterly: "",
          priceYearly: "",
          durationDays: "",
          wishlistLimit: "",
          interestLimit: "",
          features: "",
          isActive: true,
        });
        fetchPlans();
      } else {
        alert(json.error || "Failed to save plan");
      }
    } catch (err) {
      console.error("Failed to save plan:", err);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      name: "",
      tier: "FREE",
      description: "",
      priceMonthly: "",
      priceQuarterly: "",
      priceYearly: "",
      durationDays: "",
      wishlistLimit: "",
      interestLimit: "",
      features: "",
      isActive: true,
    });
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard size={22} className="text-[#f78222]" /> Subscription Plans
          </h1>
          <p className="text-muted text-sm">Manage subscription tiers, pricing, and features</p>
        </div>
        <Button variant="gold" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Plan
        </Button>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="glass p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
                  <Badge variant={plan.tier === "VIP" ? "gold" : plan.tier === "PREMIUM" ? "success" : "glass"}>
                    {plan.tier}
                  </Badge>
                  {plan.isDefault && <Badge variant="glass">Default</Badge>}
                  {!plan.isActive && <Badge variant="danger">Inactive</Badge>}
                </div>
                {plan.description && <p className="text-muted text-sm mb-3">{plan.description}</p>}
                
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wide">Monthly</span>
                    <span className="text-muted font-medium">{plan.priceMonthly ? `₹${plan.priceMonthly}` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wide">Quarterly</span>
                    <span className="text-muted font-medium">{plan.priceQuarterly ? `₹${plan.priceQuarterly}` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wide">Yearly</span>
                    <span className="text-muted font-medium">{plan.priceYearly ? `₹${plan.priceYearly}` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wide">Duration</span>
                    <span className="text-muted font-medium">{plan.durationDays ? `${plan.durationDays} days` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wide">Wishlist Limit</span>
                    <span className="text-muted font-medium">{plan.wishlistLimit || "Unlimited"}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wide">Interest Limit</span>
                    <span className="text-muted font-medium">{plan.interestLimit || "Unlimited"}</span>
                  </div>
                </div>

                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="mt-3">
                    <span className="text-muted block text-[10px] uppercase tracking-wide mb-1">Features</span>
                    <div className="flex flex-wrap gap-1">
                      {plan.features.map((feature, idx) => (
                        <span key={idx} className="text-xs text-muted bg-white/5 px-2 py-0.5 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)} disabled={plan.isDefault || deleting === plan.id} loading={deleting === plan.id}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Plan Name</label>
                  <input
                    type="text"
                    className="input-glass w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Tier</label>
                  <select
                    className="input-glass w-full"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    required
                  >
                    <option value="FREE">FREE</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
                <textarea
                  className="input-glass w-full"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Monthly Price (₹)</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Quarterly Price (₹)</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={formData.priceQuarterly}
                    onChange={(e) => setFormData({ ...formData, priceQuarterly: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Yearly Price (₹)</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={formData.priceYearly}
                    onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Duration (days)</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Wishlist Limit</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={formData.wishlistLimit}
                    onChange={(e) => setFormData({ ...formData, wishlistLimit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Interest Limit</label>
                  <input
                    type="number"
                    className="input-glass w-full"
                    value={formData.interestLimit}
                    onChange={(e) => setFormData({ ...formData, interestLimit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Features (comma-separated)</label>
                <input
                  type="text"
                  className="input-glass w-full"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="e.g., View profiles, Send interests, Chat"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-muted">Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={closeModal} disabled={saving}>Cancel</Button>
                <Button variant="gold" type="submit" loading={saving}>
                  <Save size={16} className="mr-2" /> {editingPlan ? "Update" : "Create"} Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
