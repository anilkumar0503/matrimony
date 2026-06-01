import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Premium Matrimony — Verified Matchmaking",
    template: "%s | Premium Matrimony",
  },
  description:
    "India's most trusted verified matrimony platform. Find your perfect life partner with admin-verified profiles, privacy-first design, and DPDP-compliant data protection.",
  keywords: ["matrimony", "verified profiles", "matchmaking", "Indian matrimony", "shaadi"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Premium Matrimony",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${playfair.variable} ${dmSerif.variable}`}
    >
      <body className="min-h-screen bg-[#1a0505] text-white antialiased">
        <div className="blob-bg" aria-hidden="true" />
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
