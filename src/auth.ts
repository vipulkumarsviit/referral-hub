import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                await dbConnect();
                const user = await User.findOne({ email: credentials.email }).select(
                    "+password"
                );

                if (!user || !user.password) {
                    throw new Error("Invalid email or password");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            const isOAuth =
                account?.provider === "google" || account?.provider === "linkedin";

            if (!isOAuth) {
                return true;
            }

            const email = user.email?.toLowerCase().trim();
            if (!email) {
                return false;
            }

            await dbConnect();

            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                await User.create({
                    name: user.name || email.split("@")[0],
                    email,
                    image: user.image,
                    role: "seeker",
                    isVerified: false,
                });
            } else {
                // OAuth is only allowed for job seekers.
                if (existingUser.role === "referrer") {
                    return false;
                }

                if (!existingUser.image && user.image) {
                    existingUser.image = user.image;
                    await existingUser.save();
                }
            }

            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                const userRole = (user as unknown as { role?: UserRole }).role;
                if (userRole) {
                    token.role = userRole;
                }
            }

            if (
                account?.provider === "google" ||
                account?.provider === "linkedin" ||
                (!token.id && token.email)
            ) {
                const email = token.email?.toLowerCase().trim();
                if (email) {
                    await dbConnect();
                    const dbUser = await User.findOne({ email }).select("_id role");
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.role = dbUser.role as UserRole;
                    }
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as unknown as { role?: UserRole }).role =
                    (token.role as UserRole | undefined) || "seeker";
            }
            return session;
        },
    },
});
