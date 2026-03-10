import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    ShieldCheck,
    Building2,
    Sparkles,
    Filter,
    ChevronDown,
} from "lucide-react";

/* ─── Mock data ─── */
const listings = [
    {
        id: 1,
        title: "Senior Software Engineer",
        referrer: "Mark Thompson",
        company: "Google",
        location: "Mountain View, CA",
        type: "Full-time",
        level: "Senior",
        daysLeft: 12,
        initials: "MT",
    },
    {
        id: 2,
        title: "Product Designer",
        referrer: "Sarah Chen",
        company: "Stripe",
        location: "San Francisco, CA",
        type: "Full-time",
        level: "Mid",
        daysLeft: 8,
        initials: "SC",
    },
    {
        id: 3,
        title: "Backend Engineer",
        referrer: "James Wilson",
        company: "Airbnb",
        location: "Remote",
        type: "Full-time",
        level: "Senior",
        daysLeft: 15,
        initials: "JW",
    },
    {
        id: 4,
        title: "Data Scientist, Ads",
        referrer: "Elena Rodriguez",
        company: "Meta",
        location: "New York, NY",
        type: "Full-time",
        level: "Mid",
        daysLeft: 5,
        initials: "ER",
    },
    {
        id: 5,
        title: "Staff Frontend Engineer",
        referrer: "David Lee",
        company: "Netflix",
        location: "Los Gatos, CA",
        type: "Full-time",
        level: "Staff",
        daysLeft: 20,
        initials: "DL",
    },
    {
        id: 6,
        title: "ML Engineer",
        referrer: "Priya Patel",
        company: "OpenAI",
        location: "San Francisco, CA",
        type: "Full-time",
        level: "Senior",
        daysLeft: 3,
        initials: "PP",
    },
];

const filterSections = [
    {
        label: "Role Type",
        options: ["Full-time", "Part-time", "Contract"],
    },
    {
        label: "Experience Level",
        options: ["Entry", "Mid", "Senior", "Staff"],
    },
    {
        label: "Location",
        options: ["Remote", "San Francisco", "New York", "Mountain View"],
    },
];

export default function BrowsePage() {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
                    {/* ─── Sidebar Filters ─── */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-8">
                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-dark/40">
                                <Filter className="h-4 w-4" />
                                Filters
                            </h3>

                            {filterSections.map((section) => (
                                <div key={section.label}>
                                    <button className="mb-3 flex w-full items-center justify-between text-sm font-bold text-brand-dark">
                                        {section.label}
                                        <ChevronDown className="h-4 w-4 text-brand-dark/40" />
                                    </button>
                                    <div className="space-y-2">
                                        {section.options.map((option) => (
                                            <label
                                                key={option}
                                                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-dark/70 transition-colors hover:bg-brand-dark/5"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-brand-dark/20 text-primary focus:ring-primary"
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Boost card */}
                            <Card className="border-brand-dark/5 bg-gradient-to-br from-primary/10 to-primary/5 shadow-none">
                                <CardContent className="p-5">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <h4 className="font-bold text-brand-dark">
                                        Boost your profile
                                    </h4>
                                    <p className="mt-1 text-xs text-brand-dark/60">
                                        Complete your profile to increase your chances of getting a
                                        referral by 3x.
                                    </p>
                                    <Button
                                        size="sm"
                                        className="mt-4 w-full text-xs font-bold"
                                    >
                                        Complete Profile
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </aside>

                    {/* ─── Main Content ─── */}
                    <div>
                        {/* Search header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-brand-dark md:text-4xl">
                                Active Referral Listings
                            </h1>
                            <p className="mt-2 text-brand-dark/60">
                                Showing {listings.length} open opportunities from verified
                                employees
                            </p>

                            <div className="relative mt-6">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/40" />
                                <Input
                                    placeholder="Search by role, company, or skill..."
                                    className="h-12 rounded-xl border-brand-dark/10 bg-white pl-12 text-base shadow-sm placeholder:text-brand-dark/40 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Listing cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {listings.map((listing) => (
                                <Card
                                    key={listing.id}
                                    className="group border-brand-dark/5 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                                >
                                    <CardContent className="p-6">
                                        {/* Header */}
                                        <div className="mb-4 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-brand-dark group-hover:text-primary transition-colors">
                                                    {listing.title}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-brand-dark/60">
                                                    <span>Referred by {listing.referrer}</span>
                                                </div>
                                            </div>
                                            <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                    {listing.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        {/* Company badge */}
                                        <div className="mb-4 flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="gap-1 bg-success-light/50 text-success font-medium"
                                            >
                                                <ShieldCheck className="h-3 w-3" />
                                                Verified at {listing.company}
                                            </Badge>
                                        </div>

                                        {/* Meta */}
                                        <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-brand-dark/60">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {listing.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {listing.type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {listing.daysLeft}d left
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                size="sm"
                                                className="flex-1 font-bold shadow-sm shadow-primary/20"
                                            >
                                                Request Referral
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-brand-dark/10 font-bold text-brand-dark"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <SiteFooter />
        </div>
    );
}
