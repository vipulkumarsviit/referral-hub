import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CombinedDashboard from "./CombinedDashboard";

export default async function DashboardRoot() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    const role = (session.user as { role?: "seeker" | "referrer" | "admin" })?.role;

    if (role === "admin") {
        redirect("/dashboard/admin");
    }

    return <CombinedDashboard />;
}
