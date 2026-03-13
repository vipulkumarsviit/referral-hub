import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: "user" | "admin" })?.role;
  if (role !== "admin") {
    redirect("/dashboard");
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error("Base URL is not configured (set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL)");
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${baseUrl}/api/admin/overview`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load admin overview");
  }

  const {
    totalUsers,
    totalReferrers,
    totalSeekers,
    activeListings,
    totalApplications,
    acceptedApplications,
    users,
    listings,
  } = await res.json();

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users },
    { label: "Job Seekers", value: totalSeekers, icon: Users },
    { label: "Referrers", value: totalReferrers, icon: Users },
    { label: "Active Listings", value: activeListings, icon: Briefcase },
    { label: "Total Applications", value: totalApplications, icon: FileText },
    { label: "Referrals Accepted", value: acceptedApplications, icon: CheckCircle },
  ];

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-brand-dark">Admin Dashboard</h1>
        <p className="mt-2 text-brand-dark/60">Platform metrics and recent activity overview.</p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className="border-brand-dark/5 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-brand-dark/5 p-3 text-brand-dark">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark/60">{stat.label}</p>
                <p className="text-2xl font-bold text-brand-dark">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="border-brand-dark/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user: { _id: string; name: string; email: string; role: string }) => (
                <div
                  key={user._id.toString()}
                  className="flex items-center justify-between rounded-xl border border-brand-dark/5 p-4"
                >
                  <div>
                    <p className="font-bold text-brand-dark">{user.name}</p>
                    <p className="text-xs text-brand-dark/60">{user.email}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-brand-dark/5 text-brand-dark"} border-none font-bold capitalize`}
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-dark/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Recent Job Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings.map((job: { _id: string; title: string; company: string; status: string }) => (
                <div
                  key={job._id.toString()}
                  className="flex items-center justify-between rounded-xl border border-brand-dark/5 p-4"
                >
                  <div>
                    <p className="line-clamp-1 font-bold text-brand-dark">{job.title}</p>
                    <p className="text-xs text-brand-dark/60">{job.company}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${job.status === "active" ? "bg-success-light text-success" : "bg-brand-dark/5 text-brand-dark"} border-none font-bold capitalize`}
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
