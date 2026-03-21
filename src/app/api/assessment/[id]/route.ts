import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { AssessmentResult, User } from "@/models";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const routeParams = await params;
        
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        
        const dbUser = await User.findOne({ clerkId: clerkUser.id });
        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // Verify ownership when finding the specific assessment
        const assessment = await AssessmentResult.findOne({ 
             _id: routeParams.id, 
             studentId: dbUser._id 
        });

        if (!assessment) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            report: assessment
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Fetch Assessment error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
