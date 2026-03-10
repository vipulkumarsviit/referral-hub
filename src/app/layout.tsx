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

export const metadata: Metadata = {
  title: "ReferralHub | Get referred, not just applied",
  description:
    "Skip the ATS black hole. Get your resume directly into the hands of hiring managers through verified employees at top tech companies.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
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
