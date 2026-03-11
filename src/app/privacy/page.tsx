import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold text-brand-dark">Privacy Policy</h1>
        <p className="mt-4 text-brand-dark/70">
          We respect your privacy and only collect data necessary to operate ReferralHub.
        </p>
        <p className="mt-3 text-brand-dark/70">
          If you have questions about how your data is handled, contact support.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
