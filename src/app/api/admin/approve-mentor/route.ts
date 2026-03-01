import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User, MentorProfile } from "@/models";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // Check if the requester is an ADMIN or SUPER_ADMIN
        const adminUser = await User.findOne({ clerkId: userId });
        if (!adminUser || (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await req.formData();
        const mentorId = formData.get("mentorId") as string;
        const applicantUserId = formData.get("userId") as string;

        if (!mentorId || !applicantUserId) {
            return NextResponse.redirect(new URL("/dashboard?error=missing_id", req.url), 302);
        }

        // 1. Approve the MentorProfile
        const profile = await MentorProfile.findByIdAndUpdate(mentorId, { isApproved: true }, { new: true });
        if (!profile) {
            return NextResponse.redirect(new URL("/dashboard?error=not_found", req.url), 302);
        }

        // 2. Upgrade the User role to MENTOR
        const updatedUser = await User.findByIdAndUpdate(applicantUserId, { role: "MENTOR" }, { new: true });

        if (updatedUser && updatedUser.clerkId) {
            // Optional: Sync back to Clerk's publicMetadata if you are using that for middleware checks
            try {
                const client = await clerkClient();
                await client.users.updateUserMetadata(updatedUser.clerkId, {
                    publicMetadata: {
                        role: "MENTOR"
                    }
                });
            } catch (clerkErr) {
                console.error("Failed to sync role to Clerk:", clerkErr);
                // We don't fail the request if Clerk sync fails, DB is source of truth
            }
        }

        // Redirect back to dashboard with a success message
        return NextResponse.redirect(new URL("/dashboard?success=mentor_approved", req.url), 302);

    } catch (error: unknown) {
        console.error("Error approving mentor:", error);
        return NextResponse.redirect(new URL("/dashboard?error=server_error", req.url), 302);
    }
}
