import Link from "next/link";
import { ArrowLeft, Users, CheckCircle, XCircle } from "lucide-react";
import ApplicantActions from "./ApplicantActions";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ReferrerJobViewPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    if ((session.user as any).role !== "referrer") {
        redirect("/dashboard");
    }

    const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
        throw new Error("Base URL is not configured (set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL)");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${baseUrl}/api/dashboard/listings/${params.id}`, {
        cache: "no-store",
        headers: {
            Cookie: cookieHeader,
        },
    });

    if (res.status === 404) {
        return notFound();
    }

    if (!res.ok) {
        throw new Error("Failed to load listing details");
    }

    const { job, applications, seekers: seekerMap } = await res.json();

    return (
        <div>
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-brand-dark/60 hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>

            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-brand-dark">{job.title}</h1>
                <p className="mt-2 text-brand-dark/60 flex items-center gap-2">
                    <span className="font-bold text-brand-dark">{job.company}</span> • {job.location} • {job.roleType}
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-brand-dark/5 p-6 mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-brand-dark">Applicants ({applications.length})</h2>
                </div>

                {applications.length === 0 ? (
                    <div className="text-center p-12 py-20 border border-dashed border-brand-dark/10 rounded-2xl">
                        <p className="text-brand-dark/60 font-medium">No applicants yet. Check back later!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app: any) => {
                            const applicant = seekerMap[app.jobSeekerId.toString()];
                            if (!applicant) return null;

                            return (
                                <div key={app._id.toString()} className="border border-brand-dark/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-brand-dark/20">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-brand-dark">{applicant.name}</h3>
                                            {app.status === "Accepted" && (
                                                <span className="bg-success-light text-success text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Accepted
                                                </span>
                                            )}
                                            {app.status === "Declined" && (
                                                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <XCircle className="h-3 w-3" /> Declined
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-brand-dark/80 mb-1">{applicant.jobTitle}</p>
                                        {app.resumeUrl && (
                                            <Link href={app.resumeUrl} target="_blank" className="text-sm font-semibold text-primary hover:underline">
                                                View Resume Profile ↗
                                            </Link>
                                        )}
                                        {app.note && (
                                            <p className="mt-3 text-sm text-brand-dark/60 italic bg-brand-dark/5 p-3 rounded-xl">"{app.note}"</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <ApplicantActions applicationId={app._id.toString()} currentStatus={app.status} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
