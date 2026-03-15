"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Filter, Paperclip, MoreVertical, FileText, Download, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import MessagesApp from "@/app/messages/[id]/MessagesApp";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type BaseApp = {
  appId: string;
  jobId: string;
  name: string;
  position: string;
  company: string;
  initials: string;
  preview: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isSeeker: boolean;
};

type RefJob = {
  jobId: string;
  position: string;
  company: string;
  updatedAt: string;
  applicants: BaseApp[];
};

export default function MessagesLayout({
  seekerApplications,
  referrerJobs,
}: {
  seekerApplications: BaseApp[];
  referrerJobs: RefJob[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlView = searchParams.get("view");
  const initialView = urlView === "seeker" || urlView === "referrer" ? urlView : "referrer";

  const [view, setView] = useState<"referrer" | "seeker">(initialView);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialView === "referrer" ? searchParams.get("jobApplicationId") : null
  );
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    initialView === "referrer" 
      ? searchParams.get("userId") 
      : searchParams.get("jobApplicationId")
  );
  const [seekerQuery, setSeekerQuery] = useState("");

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);

    if (view === "referrer") {
      if (selectedJobId) params.set("jobApplicationId", selectedJobId);
      else params.delete("jobApplicationId");

      if (selectedAppId) params.set("userId", selectedAppId);
      else params.delete("userId");
    } else {
      params.delete("userId");
      if (selectedAppId) params.set("jobApplicationId", selectedAppId);
      else params.delete("jobApplicationId");
    }
    
    // Replace URL without full reloads only when string actively mutates
    const currentQueryString = searchParams.toString();
    const newQueryString = params.toString();
    if (currentQueryString !== newQueryString) {
      router.replace(`${pathname}?${newQueryString}`, { scroll: false });
    }
  }, [view, selectedJobId, selectedAppId, pathname, router, searchParams]);

  // Initialize selections when view or data changes
  useEffect(() => {
    if (view === "referrer") {
      if (referrerJobs.length > 0) {
        let job = referrerJobs.find((j) => j.jobId === selectedJobId);
        let app = null;
        
        if (!job) {
          job = referrerJobs[0];
          setSelectedJobId(job.jobId);
        } else {
          app = job.applicants.find((a) => a.appId === selectedAppId);
        }
        
        if (!app && job.applicants.length > 0) {
          setSelectedAppId(job.applicants[0].appId);
        } else if (!app && job.applicants.length === 0 && selectedAppId !== null) {
          setSelectedAppId(null);
        }
      } else {
        if (selectedJobId) setSelectedJobId(null);
        if (selectedAppId) setSelectedAppId(null);
      }
    } else {
      if (seekerApplications.length > 0) {
        let app = seekerApplications.find((a) => a.appId === selectedAppId);
        if (!app) {
          app = seekerApplications[0];
          setSelectedAppId(app.appId);
        }
      } else {
        if (selectedAppId) setSelectedAppId(null);
      }
    }
  }, [view, referrerJobs, seekerApplications, selectedJobId, selectedAppId]);

  // Derived state for Referrer View
  const activeJob = useMemo(
    () => referrerJobs.find((j) => j.jobId === selectedJobId) || referrerJobs[0],
    [referrerJobs, selectedJobId]
  );
  
  const currentApplicants = activeJob ? activeJob.applicants : [];

  // Derived state for Seeker View
  const filteredSeekerApps = useMemo(() => {
    if (!seekerQuery.trim()) return seekerApplications;
    const q = seekerQuery.toLowerCase();
    return seekerApplications.filter(
      (a) =>
        a.position.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.preview.toLowerCase().includes(q)
    );
  }, [seekerApplications, seekerQuery]);

  const activeApp = useMemo(() => {
    if (view === "referrer") {
      return currentApplicants.find((a) => a.appId === selectedAppId);
    } else {
      return filteredSeekerApps.find((a) => a.appId === selectedAppId);
    }
  }, [view, currentApplicants, filteredSeekerApps, selectedAppId]);

  const formatDateShort = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return format(date, "h:mm a");
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Top Toggle Bar */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white shrink-0">
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
                setView("referrer");
                setSelectedAppId(null);
            }}
            className={`px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "referrer"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Referrer
          </button>
          <button
            onClick={() => {
                setView("seeker");
                setSelectedAppId(null);
            }}
            className={`px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "seeker"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Job Seeker
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {view === "referrer" && (
          <div className="flex w-full h-full">
            {/* Column 1: Reference Posts */}
            <div className="w-[320px] flex flex-col border-r border-slate-200 bg-slate-50/50 shrink-0">
              <div className="px-5 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">
                My Referral Posts
              </div>
              <div className="flex-1 overflow-y-auto w-full">
                {referrerJobs.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500 text-center">No referral posts yet.</div>
                ) : (
                  <ul className="flex flex-col pb-4">
                    {referrerJobs.map((job) => {
                      const active = selectedJobId === job.jobId;
                      return (
                        <li key={job.jobId} className="px-2">
                          <button
                            onClick={() => {
                              setSelectedJobId(job.jobId);
                              if (job.applicants.length > 0) {
                                setSelectedAppId(job.applicants[0].appId);
                              } else {
                                setSelectedAppId(null);
                              }
                            }}
                            className={`w-full flex justify-between items-start text-left p-3 rounded-lg relative transition-colors ${
                              active ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-slate-100/80"
                            }`}
                          >
                            {active && (
                              <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full" />
                            )}
                            <div className="flex flex-col w-full pl-2">
                              <span className="text-sm font-semibold text-slate-900 truncate">
                                {job.position}
                              </span>
                              <span className="text-sm text-indigo-600 mt-0.5">{job.company}</span>
                              <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-slate-500">
                                <FileText className="h-3.5 w-3.5 opacity-70" />
                                <span>{job.applicants.length} Applicants</span>
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap mt-0.5">
                              {formatDateShort(job.updatedAt)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="p-4 border-t border-slate-200 bg-white">
                <Link
                  href="/dashboard/listings/new"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Referral Post
                </Link>
              </div>
            </div>

            {/* Column 2: Applicants */}
            <div className="w-[360px] flex flex-col border-r border-slate-200 bg-white shrink-0">
              <div className="py-4 px-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-slate-900">Applicants</span>
                  {activeJob && (
                    <span className="text-xs font-medium text-slate-500 mt-0.5">
                      {activeJob.position} @ {activeJob.company}
                    </span>
                  )}
                </div>
                <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-50/30">
                {!activeJob || activeJob.applicants.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500 text-center">No applicants yet.</div>
                ) : (
                  <ul className="flex flex-col divide-y divide-slate-100">
                    {activeJob.applicants.map((app) => {
                      const active = selectedAppId === app.appId;
                      return (
                        <li key={app.appId}>
                          <button
                            onClick={() => setSelectedAppId(app.appId)}
                            className={`w-full flex items-start text-left p-4 relative transition-colors ${
                              active ? "bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] relative z-10" : "hover:bg-slate-50"
                            }`}
                          >
                            {active && (
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-600 rounded-r-full" />
                            )}
                            <div className="relative mr-3">
                              <div className="h-10 w-10 shrink-0 bg-slate-200 rounded-full flex items-center justify-center font-semibold text-slate-600">
                                {app.initials}
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-sm font-semibold text-slate-900 truncate pr-2">
                                  {app.name}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                                  {formatDateShort(app.updatedAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 mb-1 text-[11px] font-medium text-slate-500">
                                <Paperclip className="h-3 w-3 text-indigo-500" />
                                <span className="truncate">{app.name.split(" ")[0]}_resume.pdf</span>
                              </div>
                              <span className={`text-sm truncate ${active ? 'text-slate-700' : 'text-slate-500'}`}>
                                {app.preview}
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Column 3: Chat */}
            <div className="flex-1 bg-white flex flex-col h-full min-w-[400px] overflow-hidden">
              {selectedAppId ? (
                <MessagesApp
                  key={selectedAppId}
                  appId={selectedAppId}
                  meta={activeApp || undefined}
                  embedded={true}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 p-8 shadow-inner bg-slate-50/50">
                  Select an applicant to start messaging
                </div>
              )}
            </div>
          </div>
        )}

        {view === "seeker" && (
          <div className="flex w-full h-full">
            {/* Column 1: Applications */}
            <div className="w-[360px] flex flex-col border-r border-slate-200 bg-slate-50/50 shrink-0">
              <div className="p-4 border-b border-slate-200 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={seekerQuery}
                    onChange={(e) => setSeekerQuery(e.target.value)}
                    placeholder="Search applications..."
                    className="pl-9 h-10 bg-slate-100 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg text-sm text-slate-700"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredSeekerApps.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">No applications found.</div>
                ) : (
                  <div className="flex flex-col py-2">
                    {Array.from(new Set(filteredSeekerApps.map(a => a.status || 'Pending'))).map((status) => {
                       const statusApps = filteredSeekerApps.filter(a => (a.status || 'Pending') === status);
                       if (statusApps.length === 0) return null;
                       return (
                         <div key={status as string} className="mb-4">
                           <div className="px-5 py-3 text-xs font-bold text-slate-400 tracking-wider uppercase">
                             {status === 'Accepted' ? 'Active Applications' : status}
                           </div>
                           <ul className="flex flex-col pb-2">
                             {statusApps.map(app => {
                               const active = selectedAppId === app.appId;
                               return (
                                <li key={app.appId} className="px-2">
                                  <button
                                    onClick={() => setSelectedAppId(app.appId)}
                                    className={`w-full flex items-start text-left p-3 rounded-lg relative transition-colors ${
                                      active ? "bg-white shadow-sm ring-1 ring-slate-200 z-10" : "hover:bg-slate-100/80"
                                    }`}
                                  >
                                    {active && (
                                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full" />
                                    )}
                                    <div className="relative mx-2">
                                      <div className="h-10 w-10 shrink-0 bg-slate-200 rounded-full flex items-center justify-center font-semibold text-slate-600 shadow-sm border border-slate-100">
                                        {app.initials}
                                      </div>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0 pr-1">
                                      <div className="flex justify-between items-baseline mb-0.5">
                                        <span className="text-sm font-semibold text-slate-900 truncate pr-2">
                                          {app.position}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400 shrink-0">
                                          {formatDateShort(app.updatedAt)}
                                        </span>
                                      </div>
                                      <span className="text-sm text-indigo-600 mt-0.5 truncate">
                                        {app.company}
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-slate-500">
                                        <span className="relative flex h-2 w-2">
                                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${app.status === 'Accepted' ? 'bg-green-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
                                          <span className={`relative inline-flex rounded-full h-2 w-2 ${app.status === 'Accepted' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                        </span>
                                        <span className="truncate">{app.name} (Referrer)</span>
                                      </div>
                                    </div>
                                  </button>
                                </li>
                               );
                             })}
                           </ul>
                         </div>
                       )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Chat */}
            <div className="flex-1 bg-white flex flex-col h-full min-w-[400px] overflow-hidden">
              {selectedAppId ? (
                <MessagesApp
                  key={selectedAppId}
                  appId={selectedAppId}
                  meta={activeApp || undefined}
                  embedded={true}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 p-8 shadow-inner bg-slate-50/50">
                  Select an application to view messages
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
