import Navbar from "@/components/layout/navbar";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.png" alt="Jasmine Matrimony" className="h-15 w-auto" />
              </div>
              <p className="text-muted text-xs">India's most trusted verified matrimony platform.</p>
            </div>
            {[
              { title: "Platform", links: [
                { label: "Find Match", href: "/register" },
                { label: "Communities", href: "/communities" },
                { label: "Plans", href: "/plans" },
                { label: "Success Stories", href: "/success-stories" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
              ]},
              { title: "Company", links: [
                { label: "About Us", href: "/about" },
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
                <div className="font-medium text-foreground mb-2 text-xs">{col.title}</div>
                <ul className="space-y-1.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-muted hover:text-foreground text-xs transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-muted text-xs">© 2025 Jasmine Matrimony. All rights reserved.</p>
            <p className="text-muted text-xs">Compliant with DPDP Act 2023 • GST Registered • Secured by AES-256</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
