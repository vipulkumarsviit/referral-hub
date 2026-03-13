import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-lg space-y-6">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <h1 className="text-3xl font-extrabold text-brand-dark">Complete your profile</h1>
                    <p className="text-brand-dark/60">
                        Add your details so others know who you are and what you&apos;re looking for.
                    </p>
                </div>
                <OnboardingForm />
            </div>
        </div>
    );
}
