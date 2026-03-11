import Link from "next/link";
import { Hexagon, AtSign, Share2, ArrowRight } from "lucide-react";

const footerLinks = [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];

const socialLinks = [
    { icon: AtSign, href: "#", label: "Email" },
    { icon: Share2, href: "#", label: "Share" },
];

export function SiteFooter() {
    return (
        <footer className="border-t border-brand-dark/5 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-dark text-white">
                                <Hexagon className="h-4 w-4" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-brand-dark">ReferralHub</span>
                        </Link>

                        <p className="max-w-md text-sm text-brand-dark/60">
                            A verified network for warm introductions. Discover roles, request referrals, and stay connected
                            with trusted employees.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/jobs"
                                className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 px-4 py-2 text-xs font-semibold text-brand-dark transition-colors hover:border-primary hover:text-primary"
                            >
                                Browse referrals <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/30 transition-all hover:translate-y-[-1px]"
                            >
                                Create account
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-6 lg:items-end">
                        <nav className="flex flex-wrap justify-start gap-6 text-sm font-medium text-brand-dark/60 lg:justify-end">
                            {footerLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="transition-colors hover:text-primary"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/10 text-brand-dark/60 transition-all hover:border-primary hover:text-primary"
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-2 border-t border-brand-dark/5 pt-6 text-xs text-brand-dark/40 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} ReferralHub.</span>
                    <span>Built for the modern job seeker.</span>
                </div>
            </div>
        </footer>
    );
}
