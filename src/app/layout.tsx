import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/cookie-consent";
import { ThemeProvider } from "@/components/theme-provider";

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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jasmine Matrimony — Verified Matchmaking",
    template: "%s | Jasmine Matrimony",
  },
  description:
    "India's most trusted verified matrimony platform. Find your perfect life partner with admin-verified profiles, privacy-first design, and DPDP-compliant data protection.",
  keywords: ["matrimony", "verified profiles", "matchmaking", "Indian matrimony", "shaadi"],
  robots: { index: true, follow: true },
  icons: {
    icon: "/fevicon.png",
    shortcut: "/fevicon.png",
    apple: "/fevicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Jasmine Matrimony",
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
      className={`${jakarta.variable} ${playfair.variable} ${dmSerif.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <div className="blob-bg" aria-hidden="true" />
          <div className="page-wrapper">
            {children}
          </div>
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
