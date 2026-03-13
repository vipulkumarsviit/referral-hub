"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";

type ReferrerData = {
  listings: Array<{
    _id: string;
    title: string;
    company: string;
    applicantCount?: number;
    deadline?: string;
  }>;
  totalApplicants: number;
  acceptedApplicants: number;
};

type SeekerData = {
  applications: Array<{
    _id: string;
    jobTitle: string;
    company: string;
    status: string;
    createdAt: string;
  }>;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "Accepted":
      return (
        <Badge className="bg-success-light text-success hover:bg-success-light border-none">
          Accepted
        </Badge>
      );
    case "Declined":
      return <Badge variant="destructive">Declined</Badge>;
    case "Viewed":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
        >
          Viewed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-brand-dark/60 border-brand-dark/20">
          Applied
        </Badge>
      );
  }
}

export default function CombinedDashboard() {
  const [referrerData, setReferrerData] = useState<ReferrerData | null>(null);
  const [seekerData, setSeekerData] = useState<SeekerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [referrerRes, seekerRes] = await Promise.all([
          fetch("/api/dashboard/referrer"),
          fetch("/api/dashboard/seeker"),
        ]);

        if (!ignore) {
          if (referrerRes.ok) {
            const data = (await referrerRes.json()) as ReferrerData;
            setReferrerData(data);
          } else {
            setReferrerData({ listings: [], totalApplicants: 0, acceptedApplicants: 0 });
          }

          if (seekerRes.ok) {
            const data = (await seekerRes.json()) as SeekerData;
            setSeekerData(data);
          } else {
            setSeekerData({ applications: [] });
          }
        }
      } catch {
        if (!ignore) {
          setReferrerData({ listings: [], totalApplicants: 0, acceptedApplicants: 0 });
          setSeekerData({ applications: [] });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Dashboard</h1>
          <p className="mt-2 text-brand-dark/60">
            Track your referrals and applications in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/listings/new">
            <Button className="font-bold">Post New Referral</Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" className="font-bold">
              <Search className="mr-2 h-4 w-4" />
              Find Referrals
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Total applicants",
            value: referrerData?.totalApplicants ?? 0,
            icon: Users,
          },
          {
            label: "Referrals accepted",
            value: referrerData?.acceptedApplicants ?? 0,
            icon: CheckCircle,
          },
          {
            label: "Applications sent",
            value: seekerData?.applications.length ?? 0,
            icon: Search,
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-brand-dark/5 bg-white shadow-sm">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <stat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark/60">{stat.label}</p>
                <p className="text-3xl font-extrabold text-brand-dark">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-dark">Your Listings</h2>
          <Link href="/dashboard/listings" className="text-sm font-bold text-primary hover:underline">
            Manage listings
          </Link>
        </div>

        {referrerData?.listings.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {referrerData.listings.map((listing) => (
              <Link href={`/dashboard/listings/${listing._id}`} key={listing._id}>
                <Card className="border-brand-dark/5 bg-white shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-brand-dark line-clamp-1">
                      {listing.title}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-sm text-brand-dark/60">
                      <Building2 className="h-3.5 w-3.5" />
                      {listing.company}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-brand-dark/40" />
                        <span className="font-bold text-brand-dark">
                          {listing.applicantCount || 0}
                        </span>
                        <span className="text-brand-dark/60">Applicants</span>
                      </div>
                      {listing.deadline && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-4 w-4 text-brand-dark/40" />
                          <span className="text-brand-dark/60">
                            Ends {new Date(listing.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-sm font-bold text-primary flex items-center justify-end">
                      Review <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-brand-dark/20 p-12 text-center text-brand-dark/60">
            You have no active listings. Post one to start receiving applications.
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-dark">Your Applications</h2>
          <Link href="/jobs" className="text-sm font-bold text-primary hover:underline">
            Browse referrals
          </Link>
        </div>

        {seekerData?.applications.length ? (
          <div className="grid grid-cols-1 gap-4">
            {seekerData.applications.map((app) => (
              <Card key={app._id} className="border-brand-dark/10 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-brand-dark mb-2">
                      {app.jobTitle}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-brand-dark/60">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building2 className="h-4 w-4" />
                        {app.company}
                      </span>
                      <span>
                        Requested on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    {getStatusBadge(app.status)}
                    {app.status === "Accepted" && (
                      <Link href={`/messages/${app._id}`} className="text-sm font-bold text-primary hover:underline">
                        Go to Messages
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-brand-dark/20 p-12 text-center text-brand-dark/60">
            You haven't requested any referrals yet.
          </div>
        )}
      </section>
    </div>
  );
}
