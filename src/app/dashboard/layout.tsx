"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Hexagon,
  Home,
  List,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  MoreHorizontal,
  UserCircle2,
  Sparkles,
  ExternalLink,
  Globe,
  Gauge,
  ChevronRight,
} from "lucide-react";

type NavRole = "seeker" | "referrer";
type SidebarRole = NavRole | "admin";

const navItems: {
  icon: typeof Home;
  label: string;
  href: string;
  roles: SidebarRole[];
}[] = [
    { icon: Home, label: "Home", href: "/dashboard/admin", roles: ["admin"] },
    { icon: Home, label: "Home", href: "/dashboard", roles: ["seeker", "referrer"] },
    { icon: List, label: "My Listings", href: "/dashboard/listings", roles: ["referrer"] },
    { icon: Users, label: "Applicants", href: "/dashboard/applicants", roles: ["referrer"] },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages", roles: ["seeker", "referrer"] },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["seeker", "referrer", "admin"] },
  ];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  type Profile = { name?: string; jobTitle?: string };
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (!ignore && res.ok) {
          const data = await res.json();
          setProfile(data.user as Profile);
        }
      } catch {
        // Ignore profile fetch failures and keep session fallback values.
      }
    }

    if (session) {
      fetchProfile();
    }

    return () => {
      ignore = true;
    };
  }, [session]);

  const displayName = profile?.name || session?.user?.name || "";
  const displayEmail = session?.user?.email || "";
  const jobTitle = profile?.jobTitle || "";
  const role = (session?.user as { role?: SidebarRole } | undefined)?.role;
  const initials = displayName
    ? displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase())
      .join("")
    : "";

  const accountMenu = (
    <>
      <div className="space-y-1 px-3 py-2 text-sm text-brand-dark/55">
        <div className="grid grid-cols-[1rem_1fr] items-center gap-3 leading-none">
          <span className="flex h-4 w-4 items-center justify-center">
            <UserCircle2 className="h-4 w-4" />
          </span>
          <span className="truncate">{displayEmail || displayName || "Account"}</span>
        </div>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => router.push("/dashboard/settings")}
        className="mx-1.5 grid grid-cols-[1rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-brand-dark"
      >
        <span className="flex h-4 w-4 items-center justify-center">
          <Settings className="h-4 w-4" />
        </span>
        <span>Settings</span>
        <span className="h-4 w-4" />
      </DropdownMenuItem>

      <DropdownMenuSeparator />


      <DropdownMenuItem
        onClick={() => signOut({ callbackUrl: "/" })}
        variant="destructive"
        className="mx-1.5 grid grid-cols-[1rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium"
      >
        <span className="flex h-4 w-4 items-center justify-center">
          <LogOut className="h-4 w-4" />
        </span>
        <span>Log out</span>
        <span className="h-4 w-4" />
      </DropdownMenuItem>
    </>
  );

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <Sidebar className="border-brand-dark/5 bg-white">
        <SidebarHeader className="px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dark text-white">
              <Hexagon className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-dark">Referrer.</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 pt-2">
          <SidebarMenu>
            {navItems.map((item) => {
              if (!role || !item.roles.includes(role)) {
                return null;
              }

              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-brand-dark/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 font-bold text-primary">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-brand-dark">{displayName || "—"}</p>
                <p className="text-xs text-brand-dark/60">{jobTitle || "—"}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-dark hover:bg-brand-dark/5"
                aria-label="User menu"
              >
                <MoreHorizontal className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                sideOffset={20}
                alignOffset={0}
                className="w-[320px] rounded-3xl border border-brand-dark/15 bg-white p-1.5 shadow-xl"
              >
                {accountMenu}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="h-screen overflow-y-auto bg-background">
        <header className="flex items-center justify-between border-b border-brand-dark/5 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-brand-dark" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-white">
                <Hexagon className="h-4 w-4" />
              </div>
              <span className="font-bold text-brand-dark">Referrer.</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="inline-flex">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-[320px] rounded-3xl border border-brand-dark/15 bg-white p-1.5 shadow-xl"
            >
              {accountMenu}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
