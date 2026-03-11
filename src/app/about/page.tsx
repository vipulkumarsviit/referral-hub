import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold text-brand-dark">About ReferralHub</h1>
        <p className="mt-4 text-brand-dark/70">
          ReferralHub connects job seekers with verified referrers to unlock warm introductions and faster hiring outcomes.
        </p>
        <p className="mt-3 text-brand-dark/70">
          Our mission is to make referrals accessible, transparent, and efficient for both candidates and employees.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
