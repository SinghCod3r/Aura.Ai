import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { AssessmentResult } from "@/models";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const routeParams = await params;
        
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        
        // Find the specific assessment by ID
        const assessment = await AssessmentResult.findById(routeParams.id);

        if (!assessment) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            report: assessment
        }, { status: 200 });

    } catch (error: any) {
        console.error("Fetch Assessment error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
