import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold text-brand-dark">Terms of Service</h1>
        <p className="mt-4 text-brand-dark/70">
          By using ReferralHub, you agree to follow our platform guidelines and comply with all applicable laws.
        </p>
        <p className="mt-3 text-brand-dark/70">
          These terms may change over time. Please review them periodically.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
