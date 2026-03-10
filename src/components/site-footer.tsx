import Link from "next/link";
import { Hexagon, AtSign, Share2 } from "lucide-react";

const footerLinks = [
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Careers", href: "#" },
];

const socialLinks = [
    { icon: AtSign, href: "#", label: "Email" },
    { icon: Share2, href: "#", label: "Share" },
];

export function SiteFooter() {
    return (
        <footer className="border-t border-brand-dark/5 bg-white py-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-white">
                            <Hexagon className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-brand-dark">
                            ReferralHub
                        </span>
                    </Link>

                    {/* Links */}
                    <nav className="flex flex-wrap justify-center gap-8">
                        {footerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-brand-dark/60 transition-colors hover:text-primary"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Social */}
                    <div className="flex gap-4">
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

                <div className="mt-12 text-center text-xs text-brand-dark/40">
                    © {new Date().getFullYear()} ReferralHub Inc. Built for the modern job
                    seeker.
                </div>
            </div>
        </footer>
    );
}
