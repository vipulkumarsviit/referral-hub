import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReferrerDashboard from "./ReferrerDashboard";
import SeekerDashboard from "./SeekerDashboard";

export default async function DashboardRoot() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    const role = (session.user as { role?: "seeker" | "referrer" | "admin" })?.role;

    if (role === "admin") {
        redirect("/dashboard/admin");
    }

    if (role === "referrer") {
        return <ReferrerDashboard userId={session.user.id!} />;
    }

    return <SeekerDashboard userId={session.user.id!} />;
}
