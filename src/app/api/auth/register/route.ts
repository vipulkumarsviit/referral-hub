import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

function isEmailFormatValid(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDomainFromEmail(email: string) {
    const parts = email.split("@");
    return parts.length === 2 ? parts[1].toLowerCase() : "";
}

async function hasReachableDomain(domain: string) {
    const candidates = [`https://${domain}`, `https://www.${domain}`, `http://${domain}`];

    for (const url of candidates) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        try {
            const res = await fetch(url, {
                method: "GET",
                redirect: "follow",
                signal: controller.signal,
            });

            if (res.status === 200) {
                clearTimeout(timeout);
                return true;
            }
        } catch {
            // Try next candidate URL.
        } finally {
            clearTimeout(timeout);
        }
    }

    return false;
}

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!name || !normalizedEmail || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!isEmailFormatValid(normalizedEmail)) {
            return NextResponse.json(
                { message: "Please provide a valid email address" },
                { status: 400 }
            );
        }

        const domain = getDomainFromEmail(normalizedEmail);
        const domainIsReachable = await hasReachableDomain(domain);
        if (!domainIsReachable) {
            return NextResponse.json(
                { message: "Please provide a valid email address" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return NextResponse.json(
                { message: "Email is already registered" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: role || "seeker",
            isVerified: false,
        });

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
