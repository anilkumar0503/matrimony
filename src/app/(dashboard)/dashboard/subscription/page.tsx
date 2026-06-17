"use client";
import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { CheckCircle, Crown, Zap, Star, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  priceMonthly: number;
  priceQuarterly: number;
  priceYearly: number;
  wishlistLimit: number | null;
  interestLimit: number | null;
  canViewContactInfo: boolean;
  advancedSearch: boolean;
  anonymousBrowsing: boolean;
  adminAssistance: boolean;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: { name: string; tier: string };
}

const tierIcon = { FREE: Star, PREMIUM: Crown, VIP: Zap };
const tierColor = { FREE: "text-white/50", PREMIUM: "text-[#C9972C]", VIP: "text-purple-400" };

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [duration, setDuration] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [processing, setProcessing] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const token = () => localStorage.getItem("accessToken");

  const fetchData = useCallback(async () => {
    const [plansRes, profileRes] = await Promise.all([
      fetch("/api/subscriptions/plans").then((r) => r.json()),
      fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token()}` } }).then((r) => r.json()),
    ]);
    if (plansRes.success) setPlans(plansRes.data.plans);
    if (profileRes.success) setCurrentSub(profileRes.data.subscription || null);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const subscribe = async (planId: string) => {
    if (!scriptLoaded) return;
    setProcessing(planId);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planId, duration, couponCode: couponCode || undefined }),
      });
      const orderJson = await orderRes.json();
      if (!orderJson.success) { alert(orderJson.error); return; }

      const { orderId, amount, keyId } = orderJson.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        order_id: orderId,
        name: "Jasmine Matrimony",
        description: "Subscription",
        theme: { color: "#C9972C" },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          await fetch("/api/payments/verify", {
            method: "POST",
            headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          fetchData();
        },
        modal: { ondismiss: () => setProcessing(null) },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const getPrice = (plan: Plan) => {
    const prices = { monthly: plan.priceMonthly, quarterly: plan.priceQuarterly, yearly: plan.priceYearly };
    return prices[duration];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptLoaded(true)} />

      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Subscription Plans</h1>
        <p className="text-white/40 text-sm">Choose the plan that matches your matchmaking needs</p>
      </div>

      {/* Current subscription */}
      {currentSub && currentSub.status === "ACTIVE" && (
        <div className="glass-gold p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown size={22} className="text-[#C9972C]" />
            <div>
              <div className="font-semibold text-white">{currentSub.plan.name} — Active</div>
              <div className="text-white/50 text-xs">Valid until {formatDate(currentSub.endDate)}</div>
            </div>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      )}

      {/* Duration toggle */}
      <div className="flex items-center gap-1 glass p-1.5 rounded-xl w-fit">
        {(["monthly", "quarterly", "yearly"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${duration === d ? "bg-[rgba(201,151,44,0.15)] text-[#E8C76A] border border-[rgba(201,151,44,0.25)]" : "text-white/50 hover:text-white"}`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
            {d === "yearly" && <span className="ml-1.5 text-[10px] text-emerald-400">Save 25%</span>}
            {d === "quarterly" && <span className="ml-1.5 text-[10px] text-blue-400">Save 10%</span>}
          </button>
        ))}
      </div>

      {/* Coupon */}
      <div className="flex gap-3">
        <input
          className="input-glass flex-1 max-w-xs"
          placeholder="Coupon code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        />
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = tierIcon[plan.tier as keyof typeof tierIcon] || Star;
          const color = tierColor[plan.tier as keyof typeof tierColor] || "text-white";
          const isCurrentPlan = currentSub?.plan?.tier === plan.tier && currentSub?.status === "ACTIVE";
          const isHighlighted = plan.tier === "PREMIUM";
          const price = getPrice(plan);

          return (
            <div
              key={plan.id}
              className={`glass flex flex-col p-7 relative ${isHighlighted ? "border-[rgba(201,151,44,0.4)] ring-1 ring-[rgba(201,151,44,0.15)]" : ""}`}
            >
              {isHighlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="badge-gold text-xs px-3 py-1">✦ Most Popular</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Icon size={22} className={color} />
                <span className="font-display font-bold text-white">{plan.name}</span>
                {isCurrentPlan && <Badge variant="success" className="text-[10px]">Current</Badge>}
              </div>

              <div className="mb-5">
                {price != null && price > 0 ? (
                  <>
                    <span className="font-display text-4xl font-bold text-white">{formatCurrency(price)}</span>
                    <span className="text-white/40 text-sm">/{duration === "monthly" ? "mo" : duration === "quarterly" ? "3mo" : "yr"}</span>
                    <div className="text-white/30 text-xs mt-1">GST @ 18% inclusive</div>
                  </>
                ) : (
                  <span className="font-display text-4xl font-bold text-white">Free</span>
                )}
              </div>

              {plan.description && <p className="text-white/50 text-sm mb-5 leading-relaxed">{plan.description}</p>}

              <ul className="space-y-2.5 mb-7 flex-1">
                {[
                  { label: plan.wishlistLimit ? `${plan.wishlistLimit} wishlists/month` : "Unlimited wishlists", active: true },
                  { label: plan.interestLimit ? `${plan.interestLimit} interests/month` : "Unlimited interests", active: true },
                  { label: "Advanced search filters", active: plan.advancedSearch },
                  { label: "Anonymous browsing", active: plan.anonymousBrowsing },
                  { label: "View contact info", active: plan.canViewContactInfo },
                  { label: "Admin-assisted matching", active: plan.adminAssistance },
                ].map((feature) => (
                  <li key={feature.label} className={`flex items-center gap-2 text-sm ${feature.active ? "text-white/70" : "text-white/25 line-through"}`}>
                    <CheckCircle size={14} className={feature.active ? "text-[#C9972C] shrink-0" : "text-white/20 shrink-0"} />
                    {feature.label}
                  </li>
                ))}
              </ul>

              {price != null && price > 0 ? (
                <Button
                  variant={isHighlighted ? "gold" : "glass"}
                  onClick={() => subscribe(plan.id)}
                  loading={processing === plan.id}
                  disabled={isCurrentPlan || !scriptLoaded}
                >
                  <CreditCard size={15} />
                  {isCurrentPlan ? "Current Plan" : `Subscribe ${duration}`}
                  {!isCurrentPlan && <ArrowRight size={15} />}
                </Button>
              ) : (
                <Button variant="glass" disabled className="opacity-50">
                  {isCurrentPlan ? "Current Plan" : "Free Forever"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass p-4 text-center text-white/30 text-xs">
        Payments processed securely by Razorpay · GST invoice sent to your email · Cancel anytime
      </div>
    </div>
  );
}
