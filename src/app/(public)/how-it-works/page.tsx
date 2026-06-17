import type { Metadata } from "next";
import { UserPlus, Shield, Search, Heart, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how Jasmine Matrimony works — from creating a verified profile to finding your perfect match in 5 simple steps.",
};

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    desc: "Register with your email and complete a comprehensive profile covering personal details, family background, education, career, horoscope, and lifestyle preferences.",
    points: ["6-step guided profile setup", "Upload photos and horoscope", "Set partner preferences"],
  },
  {
    number: "02",
    icon: Shield,
    title: "Get Verified",
    desc: "Our admin team manually reviews and verifies every profile. You can optionally complete KYC verification for a trusted badge that boosts profile credibility.",
    points: ["Admin approval within 24 hours", "KYC verification for trusted badge", "Rejection reasons communicated clearly"],
  },
  {
    number: "03",
    icon: Search,
    title: "Discover Matches",
    desc: "Browse profiles using advanced filters — religion, caste, location, education, horoscope nakshatra/rashi, and more. Premium members unlock full photo visibility and advanced filters.",
    points: ["Basic & advanced search filters", "Horoscope compatibility matching", "Community-specific browsing"],
  },
  {
    number: "04",
    icon: Heart,
    title: "Express Interest",
    desc: "Found someone interesting? Send an interest request. If they accept, you've made a mutual match — the first step toward a meaningful connection.",
    points: ["Send and receive interest requests", "Mutual match on acceptance", "Wishlist profiles for later"],
  },
  {
    number: "05",
    icon: MessageSquare,
    title: "Connect with Support",
    desc: "Our relationship managers assist in facilitating a meeting between matched couples — whether virtual or in-person. We guide you through every step.",
    points: ["Admin-facilitated meeting scheduling", "Google Meet or physical meeting", "Outcome tracking and follow-up"],
  },
];

const faqs = [
  { q: "Is registration free?", a: "Yes, basic registration is free. Premium plans unlock advanced features like full photo visibility, unlimited interests, and priority in search results." },
  { q: "How long does profile verification take?", a: "Profile verification typically takes 24–48 hours. KYC verification may take slightly longer depending on document review." },
  { q: "Can I hide my profile from search?", a: "Yes, you can deactivate your profile at any time from account settings. Your profile will be immediately hidden from search results." },
  { q: "Is my personal data safe?", a: "Absolutely. We are fully compliant with the DPDP Act 2023. You control your data visibility and can request deletion at any time." },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            Find Your Match in <span className="text-gradient">5 Simple Steps</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            We've designed a thoughtful, secure process that takes you from registration to a meaningful connection — 
            with admin support and privacy protection every step of the way.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map(({ number, icon: Icon, title, desc, points }, index) => (
            <div key={number} className="glass rounded-3xl p-7 flex gap-6 relative">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[rgba(201,151,44,0.15)] border border-[rgba(201,151,44,0.2)] flex items-center justify-center">
                  <Icon size={20} className="text-[#C9972C]" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px flex-1 bg-gradient-to-b from-[rgba(201,151,44,0.3)] to-transparent mt-3 min-h-[24px]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display text-4xl font-bold text-[#C9972C]/20">{number}</span>
                  <h3 className="font-display text-xl font-bold text-white">{title}</h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {points.map((p) => (
                    <div key={p} className="flex items-center gap-1.5 text-xs text-white/50">
                      <CheckCircle size={11} className="text-[#C9972C]" /> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-8 border border-[rgba(201,151,44,0.15)]">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { plan: "Free", features: ["3 interests/month", "Limited search", "Basic profile visibility"] },
              { plan: "Premium", features: ["Unlimited interests", "Full photo visibility", "Advanced search filters"], highlight: true },
              { plan: "VIP", features: ["Everything in Premium", "Priority in search results", "Dedicated relationship manager"] },
            ].map(({ plan, features, highlight }) => (
              <div key={plan} className={`rounded-2xl p-5 ${highlight ? "bg-[rgba(201,151,44,0.1)] border border-[rgba(201,151,44,0.3)]" : "bg-white/[0.03] border border-white/[0.08]"}`}>
                <div className={`font-display text-xl font-bold mb-3 ${highlight ? "text-[#C9972C]" : "text-white"}`}>{plan}</div>
                <div className="space-y-2">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle size={11} className={highlight ? "text-[#C9972C]" : "text-white/30"} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/plans" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9972C] hover:bg-[#B8861B] text-[#1a0505] font-semibold rounded-xl transition-colors text-sm">
              View All Plans <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-2">{q}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="text-[#C9972C] hover:text-[#E8C76A] text-sm transition-colors">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Start Your Journey Today</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-3 bg-[#C9972C] hover:bg-[#B8861B] text-[#1a0505] font-semibold rounded-xl transition-colors">
              Create Free Profile
            </Link>
            <Link href="/search" className="px-8 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl transition-colors border border-white/[0.1]">
              Browse Profiles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
