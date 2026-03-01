import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User, AssessmentResult } from "@/models";

export async function POST(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { experience, domains, goal, score } = body;

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: clerkUser.id });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        // Logic to generate a mock roadmap string based on user inputs
        // In a real iteration, this would hit an LLM API directly
        const primaryDomain = domains.length > 0 ? domains[0] : "Tech";

        let roadmapString = "";
        if (experience === "Beginner") {
            roadmapString = `Start your journey in ${primaryDomain}. Focus deeply on fundamental concepts, take entry-level courses, and build your first 3 beginner projects to land your first role focusing on ${goal}.`;
        } else if (experience === "Intermediate") {
            roadmapString = `You have a great foundation! To achieve your goal of "${goal}", focus on Advanced architectural concepts in ${primaryDomain}. Build production-grade full-stack features, and prep for complex system design interviews.`;
        } else {
            roadmapString = `As a Senior taking the next step towards "${goal}", you should focus strictly on leadership, mentoring, scalable architectural principles within ${primaryDomain}, and building high-level system impact.`;
        }

        // Generate dynamic recommendations
        const recommendations = [
            `Master advanced concepts in ${primaryDomain}`,
            `Review your current trajectory against your goal: ${goal}`,
            "Book a 1:1 session with an expert mentor in your selected domains"
        ];

        const newAssessment = await AssessmentResult.create({
            studentId: dbUser._id,
            roadmap: roadmapString,
            recommendations: recommendations,
            answers: [] // Required by schema
        });

        // Optionally, update the generic profile mapping if they haven't set it yet
        // dbUser.onboardingCompleted = true; // if you had this flag

        return NextResponse.json({
            success: true,
            assessmentId: newAssessment._id,
            roadmap: roadmapString,
            recommendations
        }, { status: 201 });

    } catch (error: any) {
        console.error("Assessment creation error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
