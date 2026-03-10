import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/app/profile/ProfileForm";

export default async function SettingsPage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }

    return <ProfileForm />;
}
