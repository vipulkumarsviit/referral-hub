import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-base",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "ReferralHub | Get referred, not just applied",
  description:
    "Skip the ATS black hole. Get your resume directly into the hands of hiring managers through verified employees at top tech companies.",
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "ReferralHub | Get referred, not just applied",
    description:
      "Skip the ATS black hole. Get your resume directly into the hands of hiring managers through verified employees at top tech companies.",
    siteName: "ReferralHub",
    images: [
      {
        url: "/hero.jpg",
        width: 1200,
        height: 630,
        alt: "ReferralHub preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReferralHub | Get referred, not just applied",
    description:
      "Skip the ATS black hole. Get your resume directly into the hands of hiring managers through verified employees at top tech companies.",
    images: ["/hero.jpg"],
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${sora.variable} antialiased min-h-screen bg-brand-bg`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
