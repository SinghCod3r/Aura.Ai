import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User, MentorProfile } from "@/models";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const company = formData.get("company") as string;
        const role = formData.get("role") as string;
        const bio = formData.get("bio") as string;
        const skillsString = formData.get("skills") as string;

        if (!company || !role || !bio || !skillsString) {
            // For a real app, you might want to redirect with an error query param
            return NextResponse.redirect(new URL("/become-mentor?error=missing_fields", req.url), 302);
        }

        const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.redirect(new URL("/sign-in", req.url), 302);
        }

        if (user.role === "MENTOR" || user.role === "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url), 302);
        }

        // We no longer automatically update the User Role to MENTOR!
        // It requires Admin approval.

        // Check if they already have an application pending
        const existingProfile = await MentorProfile.findOne({ userId: user._id });
        if (existingProfile) {
            return NextResponse.redirect(new URL("/dashboard?status=already_pending", req.url), 302);
        }

        // Create the associated MentorProfile as PENDING
        await MentorProfile.create({
            userId: user._id,
            expertise: skills,
            bio: bio,
            hourlyRate: 50, // Default for now
            designation: role,
            company: company,
            isApproved: false
        });

        // Redirect to dashboard with a pending message
        return NextResponse.redirect(new URL("/dashboard?status=pending", req.url), 302);
    } catch (error: unknown) {
        console.error("Error processing mentor application:", error);
        return NextResponse.redirect(new URL("/become-mentor?error=server_error", req.url), 302);
    }
}
