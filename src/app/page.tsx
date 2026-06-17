import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Star, Users, CheckCircle, ArrowRight, Crown, Lock } from "lucide-react";

const features = [
  { icon: Shield, title: "Triple-Layer Verification", desc: "Every profile is KYC-verified with selfie, government ID, and Digio e-KYC options." },
  { icon: Heart, title: "Admin-Assisted Matching", desc: "Our dedicated team personally helps VIP members find the most compatible partners." },
  { icon: Lock, title: "DPDP Act 2023 Compliant", desc: "Your data is protected by India's strictest privacy laws. Full data control in your hands." },
  { icon: Star, title: "Privacy-First Design", desc: "Field-level visibility controls. Photos visible only to verified members." },
  { icon: Users, title: "Curated Communities", desc: "Join religion, region, and interest-based communities to connect with like-minded families." },
  { icon: Crown, title: "Premium Experience", desc: "From browse to match — an elegant experience designed for serious matrimony seekers." },
];

const stats = [
  { value: "50,000+", label: "Verified Profiles" },
  { value: "8,200+", label: "Happy Couples" },
  { value: "98%", label: "Trust Score" },
  { value: "15+", label: "Communities" },
];

const plans = [
  {
    name: "Free", price: "₹0", tag: "Basic", highlight: false,
    features: ["5 wishlists", "3 interests/month", "Basic search"],
    cta: "Start Free", btnVariant: "glass" as const,
  },
  {
    name: "Premium", price: "₹999", tag: "Most Popular", highlight: true,
    features: ["25 wishlists", "20 interests/month", "Advanced search filters", "Anonymous browsing", "Who viewed me", "Premium badge"],
    cta: "Go Premium", btnVariant: "gold" as const,
  },
  {
    name: "VIP", price: "₹2,499", tag: "Best Value", highlight: false,
    features: ["Unlimited everything", "Admin-assisted matchmaking", "Priority listing", "VIP badge & support", "All premium features"],
    cta: "Go VIP", btnVariant: "glass" as const,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7B1D1D]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
          <span className="badge-gold mb-6 inline-flex">
            <Shield size={12} />
            KYC-Verified Profiles Only
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect{" "}
            <span className="shimmer-text">Life Partner</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            India's most trusted verified matrimony platform. Every profile is admin-approved,
            KYC-verified, and protected by DPDP Act 2023 compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="xl" asChild>
              <Link href="/register">Create Free Profile <ArrowRight size={18} /></Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link href="/search">Browse Profiles</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {["DPDP Compliant", "256-bit Encrypted", "Admin Verified", "100% Genuine"].map((b) => (
              <span key={b} className="badge-glass">
                <CheckCircle size={10} className="text-[#C9972C]" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="glass text-center py-8">
              <div className="font-display text-3xl font-bold shimmer-text mb-1">{s.value}</div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Why Choose Us?</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Built for families who value trust, privacy, and a dignified matchmaking experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass p-6 hover:border-[rgba(201,151,44,0.25)] transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-[rgba(201,151,44,0.1)] border border-[rgba(201,151,44,0.2)] flex items-center justify-center mb-4 group-hover:bg-[rgba(201,151,44,0.15)] transition-colors">
                  <f.icon size={22} className="text-[#C9972C]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 px-4" id="plans">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/50 text-lg">No hidden charges. GST inclusive. Cancel anytime.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass p-8 flex flex-col ${plan.highlight ? "border-[rgba(201,151,44,0.4)] ring-1 ring-[rgba(201,151,44,0.2)] relative" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge-gold text-xs px-3 py-1">✦ {plan.tag}</span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-white/60 text-sm mb-1">{plan.name}</div>
                  <div className="font-display text-4xl font-bold text-white">
                    {plan.price}
                    <span className="text-lg font-normal text-white/40">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle size={14} className="text-[#C9972C] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.btnVariant} asChild>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto glass-gold text-center py-16 px-8 rounded-2xl">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Begin Your Journey Today</h2>
          <p className="text-white/60 mb-8">
            Join thousands of verified families. Create your free profile in minutes.
          </p>
          <Button variant="gold" size="xl" asChild>
            <Link href="/register">Create Free Profile <ArrowRight size={18} /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart size={16} className="text-[#C9972C]" />
                <span className="font-display font-bold text-white">Jasmine Matrimony</span>
              </div>
              <p className="text-white/40 text-sm">India's most trusted verified matrimony platform.</p>
            </div>
            {[
              { title: "Platform", links: [
                { label: "Find Match", href: "/register" },
                { label: "Communities", href: "/register" },
                { label: "Plans", href: "/plans" },
                { label: "Success Stories", href: "/success-stories" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
              ]},
              { title: "Company", links: [
                { label: "About Us", href: "/" },
                { label: "Contact", href: "/contact" },
                { label: "Press", href: "/contact" },
              ]},
              { title: "Legal", links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "DPDP Rights", href: "/dashboard/settings#dpdp" },
              ]},
            ].map((col) => (
              <div key={col.title}>
                <div className="font-medium text-white/80 mb-3 text-sm">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-white/40 hover:text-white/70 text-sm transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">© 2025 Jasmine Matrimony. All rights reserved.</p>
            <p className="text-white/30 text-xs">Compliant with DPDP Act 2023 • GST Registered • Secured by AES-256</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
