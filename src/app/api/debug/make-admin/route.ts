import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/models";

// DO NOT EXPOSE THIS IN A REAL PRODUCTION APP WITHOUT A SECRET KEY!
// THIS IS FOR EASILY TESTING THE DASHBOARD LOCALLY

export async function GET(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.role = "ADMIN";
        await user.save();

        return NextResponse.redirect(new URL("/dashboard", req.url), 302);
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
