import Link from "next/link";
import { Crown, Check, ChevronLeft, Sparkles, Shield } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Premium Subscription Plans",
  description: "Choose the right plan — Free, Premium, or VIP — and find your life partner faster on our verified matrimony platform.",
};

export default async function PlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true, communityId: null },
    orderBy: { tier: "asc" },
  });

  const tierConfig: Record<string, { icon: React.ReactNode; color: string; border: string; featured: boolean; badge: string }> = {
    FREE: {
      icon: <Shield size={22} className="text-muted" />,
      color: "text-muted",
      border: "border-border",
      featured: false,
      badge: "",
    },
    PREMIUM: {
      icon: <Sparkles size={22} className="text-[#C9972C]" />,
      color: "text-[#E8C76A]",
      border: "border-[#C9972C]/40",
      featured: true,
      badge: "Most Popular",
    },
    VIP: {
      icon: <Crown size={22} className="text-[#E8C76A]" />,
      color: "text-[#E8C76A]",
      border: "border-[#E8C76A]/30",
      featured: false,
      badge: "Best Value",
    },
  };

  const defaultFeatures: Record<string, string[]> = {
    FREE: ["5 interests per day", "View 10 profiles daily", "Basic search filters", "Email support"],
    PREMIUM: ["Unlimited interests", "Unlimited profile views", "Advanced filters", "See contact details on acceptance", "Priority customer support", "Photo gallery access"],
    VIP: ["Everything in Premium", "Dedicated matchmaking manager", "Highlighted profile", "Access to exclusive communities", "Family connect feature", "Weekly match report", "Concierge onboarding"],
  };

  type DbPlan = typeof plans[number];
  const displayPlans = plans.length > 0 ? plans.map((p: DbPlan) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    features: (p.features as string[] | null) || defaultFeatures[p.tier] || [],
    config: tierConfig[p.tier] || tierConfig.FREE,
  })) : (["FREE", "PREMIUM", "VIP"] as const).map((tier) => ({
    id: tier,
    name: tier === "FREE" ? "Basic" : tier === "PREMIUM" ? "Premium" : "VIP Elite",
    tier,
    priceMonthly: tier === "FREE" ? 0 : tier === "PREMIUM" ? 999 : 2499,
    priceYearly: tier === "FREE" ? 0 : tier === "PREMIUM" ? 9999 : 24999,
    features: defaultFeatures[tier],
    config: tierConfig[tier],
  }));

  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <Crown size={13} /> Plans & Pricing
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Your Perfect <span className="text-gold">Match Faster</span>
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Upgrade to unlock unlimited access, contact details, and priority support. All plans include KYC-verified profiles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {displayPlans.map((plan: typeof displayPlans[number]) => (
            <div key={plan.id}
              className={`glass p-6 relative flex flex-col border ${plan.config.border} ${plan.config.featured ? "ring-1 ring-[#C9972C]/30" : ""}`}>
              {plan.config.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-gold text-[11px] whitespace-nowrap">
                  {plan.config.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {plan.config.icon}
                <span className={`font-display text-xl font-bold ${plan.config.color}`}>{plan.name}</span>
              </div>

              {plan.priceMonthly === 0 ? (
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">Free</span>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-foreground">{formatCurrency(plan.priceMonthly || 0)}</span>
                    <span className="text-muted mb-1">/mo</span>
                  </div>
                  {plan.priceYearly && (
                    <div className="text-muted text-xs mt-1">
                      {formatCurrency(plan.priceYearly)}/year · save {Math.round((1 - plan.priceYearly / (plan.priceMonthly! * 12)) * 100)}%
                    </div>
                  )}
                </div>
              )}

              <ul className="space-y-2.5 mb-8 flex-1">
                {(plan.features as string[]).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <Check size={14} className="text-[#C9972C] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.priceMonthly === 0 ? "/register" : "/register?plan=" + plan.tier.toLowerCase()}
                className={plan.config.featured ? "btn-gold w-full text-center" : "btn-glass w-full text-center"}
              >
                {plan.priceMonthly === 0 ? "Start Free" : `Get ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>

        <div className="glass p-6 text-center text-muted text-sm">
          All prices include 18% GST. Secure payment via Razorpay. Cancel anytime.
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-muted transition-colors">Terms apply</Link>
        </div>
      </div>
    </>
  );
}
