import Link from "next/link";
import { HelpCircle, ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Jasmine Matrimony — registration, KYC, subscriptions, and more.",
};

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  type FaqItem = typeof faqs[number];
  const grouped = faqs.reduce<Record<string, FaqItem[]>>((acc: Record<string, FaqItem[]>, faq: FaqItem) => {
    const cat = faq.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const fallbackFAQs: Record<string, { question: string; answer: string }[]> = {
    "Getting Started": [
      { question: "Is registration free?", answer: "Yes, basic registration is completely free. You can create a profile, view limited profiles, and send a limited number of interests on our free plan." },
      { question: "How old do I need to be to register?", answer: "Women must be at least 18 years old. Men must be at least 21 years old as per Indian marriage laws." },
      { question: "Can I register on behalf of a family member?", answer: "Yes, you can register on behalf of an immediate family member (son/daughter/sibling). The profile must clearly indicate this and the person must consent." },
    ],
    "KYC & Verification": [
      { question: "Why is KYC mandatory?", answer: "KYC (Know Your Customer) verification ensures the safety and authenticity of all members. Verified profiles get a trust badge, increasing their chances of receiving responses." },
      { question: "What documents are accepted for KYC?", answer: "We accept PAN Card, Voter ID, Passport, and Driving Licence as identity proof." },
      { question: "How long does KYC verification take?", answer: "Selfie-based verification (Mode A) typically takes 30 minutes to 4 hours. Manual document verification may take up to 24 hours." },
    ],
    "Subscriptions": [
      { question: "What are the subscription plans?", answer: "We offer Free, Premium, and VIP plans. Premium gives you unlimited interests and contact visibility. VIP includes a dedicated matchmaking manager and community access." },
      { question: "Can I cancel my subscription?", answer: "You can cancel auto-renewal at any time. The subscription remains active until the end of the paid period." },
      { question: "Do you offer refunds?", answer: "Subscriptions are generally non-refundable once activated. However, if you face technical issues caused by us, we may issue a prorated refund." },
    ],
    "Privacy & Safety": [
      { question: "Who can see my phone number?", answer: "Your phone number is only visible to members you have mutually accepted interest with. Guests and basic members cannot see contact details." },
      { question: "Can I hide my profile?", answer: "Yes. You can enable anonymous browsing from your privacy settings, which hides your profile from non-matched members." },
      { question: "How do I report someone?", answer: "Use the 'Report' button on any profile or contact our support team. All reports are reviewed within 24 hours." },
    ],
  };

  const displayData = Object.keys(grouped).length > 0 ? grouped : fallbackFAQs;

  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <HelpCircle size={13} /> Help Centre
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-white/50">Everything you need to know about Jasmine Matrimony</p>
        </div>

        <div className="space-y-8">
          {Object.entries(displayData).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-display text-xl font-bold text-[#E8C76A] mb-4">{category}</h2>
              <div className="space-y-3">
                {(items as { question: string; answer: string }[]).map((faq, i) => (
                  <details key={i} className="glass group">
                    <summary className="p-4 cursor-pointer flex items-center justify-between text-white font-medium list-none hover:text-[#E8C76A] transition-colors">
                      <span>{faq.question}</span>
                      <span className="text-white/40 group-open:rotate-180 transition-transform text-lg">⌄</span>
                    </summary>
                    <div className="px-4 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/[0.06] pt-3">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 glass p-6 text-center">
          <p className="text-white/50 mb-4">Can&apos;t find what you&apos;re looking for?</p>
          <div className="flex gap-3 justify-center">
            <Link href="/contact" className="badge-glass">Contact Support</Link>
            <Link href="/register" className="badge-gold">Get Started</Link>
          </div>
        </div>
      </div>
    </>
  );
}
