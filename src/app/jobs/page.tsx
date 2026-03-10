"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Briefcase, Search, ArrowRight, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function JobsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterExp, setFilterExp] = useState("");

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("q", searchQuery);
            if (filterRole) params.append("roleType", filterRole);
            if (filterExp) params.append("experienceLevel", filterExp);

            const res = await fetch(`/api/jobs?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setListings(data.listings);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [filterRole, filterExp]); // Re-fetch on filter change

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">
                        Find your next <span className="text-primary">referral</span>
                    </h1>
                    <p className="text-lg md:text-xl text-brand-dark/60 max-w-2xl mx-auto">
                        Skip the line. Apply directly through verified employees at top companies.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-12 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-brand-dark/5">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-dark/40" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search role, company, or location..."
                                className="pl-10 h-12 text-base rounded-xl border-brand-dark/10"
                            />
                        </div>

                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="h-12 rounded-xl border border-brand-dark/10 bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[150px]"
                        >
                            <option value="">All Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                        </select>

                        <select
                            value={filterExp}
                            onChange={(e) => setFilterExp(e.target.value)}
                            className="h-12 rounded-xl border border-brand-dark/10 bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[150px]"
                        >
                            <option value="">All Levels</option>
                            <option value="Entry">Entry (0-2y)</option>
                            <option value="Mid">Mid (3-5y)</option>
                            <option value="Senior">Senior (5y+)</option>
                        </select>

                        <Button type="submit" className="h-12 px-8 font-bold rounded-xl shadow-lg shadow-primary/20">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                ) : listings.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl border border-brand-dark/5 shadow-sm">
                        <h3 className="text-xl font-bold text-brand-dark">No referrals found</h3>
                        <p className="text-brand-dark/60 mt-2">Try adjusting your search filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((job) => (
                            <Card key={job._id} className="flex flex-col border-brand-dark/5 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <div className="p-2.5 bg-brand-dark/5 rounded-xl text-brand-dark shrink-0">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold">
                                            {job.experienceLevel}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-brand-dark line-clamp-1">{job.title}</CardTitle>
                                    <CardDescription className="text-sm font-medium text-brand-dark line-clamp-1">{job.company}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4 pt-0">
                                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-brand-dark/60">
                                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.roleType}</span>
                                    </div>
                                    <p className="text-sm text-brand-dark/60 line-clamp-3">
                                        {job.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-brand-dark/5 flex justify-between items-center">
                                    <span className="text-xs text-brand-dark/40 flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </span>
                                    <Link href={`/jobs/${job._id}`}>
                                        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5 font-bold p-0 px-3">
                                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <SiteFooter />
        </div>
    );
}
