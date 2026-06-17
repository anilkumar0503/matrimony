import type { Metadata } from "next";
import { Shield, Heart, Users, Award, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Jasmine Matrimony — India's trusted verified matrimony platform built on privacy, trust, and genuine matchmaking.",
};

const values = [
  { icon: Shield, title: "Trust & Verification", desc: "Every profile is manually verified by our team. No fake profiles, no bots — only genuine seekers." },
  { icon: Lock, title: "Privacy First", desc: "DPDP Act 2023 compliant. You control your data, visibility, and who can contact you." },
  { icon: Heart, title: "Genuine Matchmaking", desc: "We focus on meaningful connections, not just numbers. Quality over quantity, always." },
  { icon: Users, title: "Community Rooted", desc: "Built for India's diverse communities — caste, region, religion — with deep cultural understanding." },
];

const stats = [
  { value: "10,000+", label: "Verified Profiles" },
  { value: "2,500+", label: "Successful Matches" },
  { value: "50+", label: "Communities Served" },
  { value: "98%", label: "Profile Verification Rate" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(201,151,44,0.1)] border border-[rgba(201,151,44,0.2)] text-[#C9972C] text-xs font-medium mb-6">
            <Award size={12} /> Our Story
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            Redefining Matrimony for <span className="text-gradient">Modern India</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Jasmine Matrimony was founded with a singular mission: create a matrimony platform that families can truly trust. 
            In a space cluttered with unverified profiles and privacy breaches, we built something different — 
            a human-first platform where every connection is meaningful.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="glass rounded-2xl p-6 text-center">
              <div className="font-display text-3xl font-bold text-[#C9972C] mb-1">{value}</div>
              <div className="text-white/50 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                We believe finding a life partner is one of life's most important decisions. Our platform exists to make 
                that journey safe, dignified, and successful — not just for individuals, but for entire families.
              </p>
              <p className="text-white/60 leading-relaxed">
                Every feature we build, every policy we enforce, is guided by one question: 
                <em className="text-white/80"> "Does this serve the genuine matchmaker?"</em>
              </p>
            </div>
            <div className="space-y-4">
              {["Admin-verified profiles only", "Zero tolerance for fake accounts", "Family-friendly communication", "DPDP Act 2023 compliant data handling", "Transparent subscription model"].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-[#C9972C] shrink-0" />
                  <span className="text-white/70 text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-10">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(201,151,44,0.15)] flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#C9972C]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DPDP Compliance */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-8 border border-[rgba(201,151,44,0.15)] text-center">
            <Lock size={32} className="text-[#C9972C] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-white mb-3">DPDP Act 2023 Compliant</h2>
            <p className="text-white/60 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
              We are fully compliant with India's Digital Personal Data Protection Act 2023. 
              We collect only what we need, store data securely, and give you complete control 
              over your personal information at all times.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Right to Access", "Right to Correction", "Right to Erasure", "Consent-Based Processing", "Data Breach Notification"].map((right) => (
                <span key={right} className="px-3 py-1.5 rounded-full bg-[rgba(201,151,44,0.08)] border border-[rgba(201,151,44,0.15)] text-[#C9972C] text-xs">
                  {right}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Begin?</h2>
          <p className="text-white/60 mb-8">Join thousands of verified profiles and find your perfect match today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-3 bg-[#C9972C] hover:bg-[#B8861B] text-[#1a0505] font-semibold rounded-xl transition-colors">
              Create Free Profile
            </Link>
            <Link href="/how-it-works" className="px-8 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl transition-colors border border-white/[0.1]">
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
