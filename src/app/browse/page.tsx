"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  ShieldCheck,
  Sparkles,
  Filter,
  ChevronDown,
  Loader2,
} from "lucide-react";

type Listing = {
  _id: string;
  title: string;
  company: string;
  location: string;
  roleType: string;
  experienceLevel: string;
  deadline?: string;
  createdAt?: string;
};

const roleTypeOptions = ["Full-time", "Part-time", "Contract"];
const experienceOptions = ["Entry", "Mid", "Senior", "Staff"];

function getDaysLeft(deadline?: string, createdAt?: string) {
  if (deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const ms = end.getTime() - now.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d left`;
  }

  if (createdAt) {
    const created = new Date(createdAt);
    return `Posted ${created.toLocaleDateString()}`;
  }

  return "Active";
}

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterExp, setFilterExp] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchListings() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append("q", searchQuery.trim());
        if (filterRole) params.append("roleType", filterRole);
        if (filterExp) params.append("experienceLevel", filterExp);

        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to load listings");
        }

        const data = (await res.json()) as { listings: Listing[] };
        if (!ignore) {
          setListings(data.listings || []);
        }
      } catch {
        if (!ignore) {
          setListings([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchListings();

    return () => {
      ignore = true;
    };
  }, [searchQuery, filterRole, filterExp]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-dark/40">
                <Filter className="h-4 w-4" />
                Filters
              </h3>

              <div>
                <button className="mb-3 flex w-full items-center justify-between text-sm font-bold text-brand-dark">
                  Role Type
                  <ChevronDown className="h-4 w-4 text-brand-dark/40" />
                </button>
                <div className="space-y-2">
                  {roleTypeOptions.map((option) => {
                    const checked = filterRole === option;
                    return (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-dark/70 transition-colors hover:bg-brand-dark/5"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setFilterRole(checked ? "" : option)}
                          className="h-4 w-4 rounded border-brand-dark/20 text-primary focus:ring-primary"
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <button className="mb-3 flex w-full items-center justify-between text-sm font-bold text-brand-dark">
                  Experience Level
                  <ChevronDown className="h-4 w-4 text-brand-dark/40" />
                </button>
                <div className="space-y-2">
                  {experienceOptions.map((option) => {
                    const checked = filterExp === option;
                    return (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-dark/70 transition-colors hover:bg-brand-dark/5"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setFilterExp(checked ? "" : option)}
                          className="h-4 w-4 rounded border-brand-dark/20 text-primary focus:ring-primary"
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              </div>

              <Card className="border-brand-dark/5 bg-gradient-to-br from-primary/10 to-primary/5 shadow-none">
                <CardContent className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-brand-dark">Boost your profile</h4>
                  <p className="mt-1 text-xs text-brand-dark/60">
                    Complete your profile to increase your chances of getting a referral by 3x.
                  </p>
                  <Link href="/dashboard/settings">
                    <Button size="sm" className="mt-4 w-full text-xs font-bold">
                      Complete Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>

          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-brand-dark md:text-4xl">
                Active Referral Listings
              </h1>
              <p className="mt-2 text-brand-dark/60">
                Showing {listings.length} open opportunities from verified employees
              </p>

              <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by role, company, or location..."
                  className="h-12 rounded-xl border-brand-dark/10 bg-white pl-12 text-base shadow-sm placeholder:text-brand-dark/40 focus-visible:ring-primary"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <Card className="border-brand-dark/5 bg-white shadow-sm">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-bold text-brand-dark">No referrals found</h3>
                  <p className="mt-2 text-brand-dark/60">Try adjusting your filters or search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {listings.map((listing) => (
                  <Card
                    key={listing._id}
                    className="group border-brand-dark/5 bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-brand-dark transition-colors group-hover:text-primary">
                            {listing.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-brand-dark/60">
                            <span>{listing.company}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 bg-success-light/50 font-medium text-success">
                          <ShieldCheck className="h-3 w-3" />
                          Verified listing
                        </Badge>
                      </div>

                      <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-brand-dark/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {listing.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {listing.roleType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {getDaysLeft(listing.deadline, listing.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/jobs/${listing._id}`} className="flex-1">
                          <Button size="sm" className="w-full font-bold shadow-sm shadow-primary/20">
                            Request Referral
                          </Button>
                        </Link>
                        <Link href={`/jobs/${listing._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-brand-dark/10 font-bold text-brand-dark"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
