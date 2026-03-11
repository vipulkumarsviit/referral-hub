import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  UserSearch,
  Send,
  CheckCircle,
  FileText,
  MousePointerClick,
  CalendarCheck,
  Mail,
  Users,
  Award,
} from "lucide-react";
import Link from "next/link";

/* ─── Company logos (placeholder SVGs) ─── */
const companies = ["Google", "Stripe", "Linear", "Notion"];

/* ─── Step data ─── */
const seekerSteps = [
  {
    num: 1,
    icon: FileText,
    title: "Build your profile",
    desc: "Upload your resume and highlight your best work and achievements.",
  },
  {
    num: 2,
    icon: MousePointerClick,
    title: "Request a referral",
    desc: "Find insiders at your dream companies and request a referral in one click.",
  },
  {
    num: 3,
    icon: CalendarCheck,
    title: "Get Interviewed",
    desc: "Referrals get 10x higher response rates than cold applications.",
  },
];

const referrerSteps = [
  {
    num: 1,
    icon: Mail,
    title: "Verify your role",
    desc: "Use your work email to join our community of verified referrers.",
  },
  {
    num: 2,
    icon: Users,
    title: "Review candidates",
    desc: "Browse high-quality candidates looking for roles at your company.",
  },
  {
    num: 3,
    icon: Award,
    title: "Earn rewards",
    desc: "Earn referral bonuses and help your team hire better talent.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* ════════════ Hero ════════════ */}
        <section className="relative overflow-hidden px-6 pb-16 pt-20 lg:pb-24 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Copy */}
              <div className="flex flex-col gap-8">
                <Badge
                  variant="secondary"
                  className="w-fit gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Trusted by 50,000+ professionals
                  </span>
                </Badge>

                <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-brand-dark md:text-7xl">
                  Get referred.
                  <br />
                  <span className="text-primary">Not just applied.</span>
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-brand-dark/70 md:text-xl">
                  Skip the black hole of ATS. Get your resume directly into the
                  hands of hiring managers through verified employees at top tech
                  companies.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/jobs">
                    <Button
                      size="lg"
                      className="h-14 rounded-xl px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:bg-primary/90"
                    >
                      I&apos;m looking for a job
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 rounded-xl border-2 border-brand-dark/10 bg-white px-8 text-base font-bold text-brand-dark transition-all hover:bg-brand-dark/5"
                    >
                      I want to refer someone
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero visual */}
              <div className="relative lg:ml-10">
                <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-primary/20 to-brand-dark/5 p-4 ring-1 ring-brand-dark/5">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white shadow-2xl">
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="rounded-2xl bg-primary/10 p-6">
                        <Users className="h-16 w-16 text-primary" />
                      </div>
                      <p className="text-lg font-bold text-brand-dark">
                        Connecting talent with opportunity
                      </p>
                      <p className="text-sm text-brand-dark/60">
                        50,000+ referrals processed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating notification card */}
                <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-brand-dark/5 bg-white p-6 shadow-2xl md:block">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">
                        Referral accepted
                      </p>
                      <p className="text-xs text-brand-dark/60">
                        Interview scheduled at Stripe
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Social Proof ════════════ */}
        <section className="border-y border-brand-dark/5 bg-white/50 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-10 text-center text-sm font-bold uppercase tracking-[0.2em] text-brand-dark/40">
              Trusted by employees at
            </p>
            <div className="grid grid-cols-2 items-center gap-8 opacity-60 transition-all hover:opacity-100 md:grid-cols-4 lg:gap-16">
              {companies.map((company) => (
                <div key={company} className="flex justify-center">
                  <div className="flex h-10 items-center gap-2 text-brand-dark/60">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark/10">
                      <span className="text-xs font-bold text-brand-dark/60">
                        {company[0]}
                      </span>
                    </div>
                    <span className="text-base font-bold tracking-tight">
                      {company}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ How It Works ════════════ */}
        <section className="py-12 lg:py-16" id="how-it-works">
          <div className="mx-auto mb-20 max-w-7xl px-6 text-center">
            <h2 className="text-4xl font-extrabold text-brand-dark md:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-brand-dark/60">
              Two sides of the same coin. Helping talent meet opportunity.
            </p>
          </div>

          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              {/* Job Seekers Card — Light */}
              <div className="rounded-3xl border border-brand-dark/5 bg-white p-10 shadow-sm">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
                  <UserSearch className="h-7 w-7" />
                </div>
                <h3 className="mb-8 text-2xl font-bold text-brand-dark">
                  For Job Seekers
                </h3>
                <div className="space-y-10">
                  {seekerSteps.map((step) => (
                    <div key={step.num} className="flex gap-6">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {step.num}
                      </span>
                      <div>
                        <h4 className="font-bold text-brand-dark">
                          {step.title}
                        </h4>
                        <p className="text-brand-dark/60">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrers Card — Dark */}
              <div className="rounded-3xl bg-brand-dark p-10 text-white shadow-2xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-dark">
                  <Send className="h-7 w-7" />
                </div>
                <h3 className="mb-8 text-2xl font-bold">For Referrers</h3>
                <div className="space-y-10">
                  {referrerSteps.map((step) => (
                    <div key={step.num} className="flex gap-6">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                        {step.num}
                      </span>
                      <div>
                        <h4 className="font-bold">{step.title}</h4>
                        <p className="text-white/60">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ CTA Banner ════════════ */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-center text-white lg:py-24">
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold md:text-6xl">
              Ready to jumpstart your career?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
              Join the professionals getting referred at the world&apos;s
              most innovative companies.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="rounded-xl bg-white px-8 py-4 text-base font-bold text-primary transition-all hover:bg-white/90"
                >
                  Get Started Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border border-white/20 bg-transparent px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* ════════════ Feedback CTA ════════════ */}
        <section className="border-y border-brand-dark/5 bg-white/50 px-6 py-16">
          <div className="mx-auto max-w-7xl text-center">
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-brand-dark/40">
              We’re still improving
            </p>
            <h3 className="text-3xl font-extrabold text-brand-dark md:text-4xl">
              Your feedback is valuable to us.
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-base text-brand-dark/60">
              Help shape ReferralHub by reporting issues or suggesting features you want next.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/feedback">
                <Button className="rounded-xl px-7 font-bold">Share feedback</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
