import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User, AssessmentResult } from "@/models";
import mongoose from "mongoose";
import { evaluateSessionPolicy } from "@/lib/interviewPolicyEngine";
export async function POST(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser && process.env.NODE_ENV !== "development") {
            return NextResponse.json({ error: "Unauthorized - Please log in." }, { status: 401 });
        }

        const body = await req.json();
        const { context, history } = body;
        
        let dbUser = null;
        try {
            await connectToDatabase();
            if (clerkUser) {
                dbUser = await User.findOne({ clerkId: clerkUser.id });
            }
        } catch (dbConnErr) {
            console.warn("MongoDB connection failed. Continuing in offline mode.", dbConnErr);
        }

        // -----------------------------------------------------------------------------------
        // REINFORCEMENT LEARNING POLICY EVALUATION (No GenAI)
        // -----------------------------------------------------------------------------------
        
        const primaryDomain = context.domains?.[0] || 'Technical';
        const finalDifficulty = body.finalDifficulty || 5;

        const evaluationStats = evaluateSessionPolicy(history, primaryDomain, finalDifficulty);

        const { score, strengths, weaknesses, roadmap: roadmapString, recommendations } = evaluationStats;

        // Format answers for DB schema
        const dbAnswers = history.map((item: any, i: number) => ({
            questionId: `q_${i}`,
            answerValue: item.answer || "No answer provided"
        }));

        // Note: In standard JS model we added dynamically `overallScore`, `strengths`, `weaknesses` to the schema in the planning phase.
        // For mongoose schema safety (since the schema relies on Strict mode usually), we will save them in `skillGap` or update the schema next.
        
        let assessmentId = "fallback-" + Date.now();
        
        try {
            const newAssessment = await AssessmentResult.create({
                studentId: dbUser?._id || new mongoose.Types.ObjectId(),
                roadmap: roadmapString,
                skillGap: { overallScore: score, strengths, weaknesses },
                recommendations: recommendations,
                answers: dbAnswers
            });
            assessmentId = newAssessment._id.toString();
        } catch (dbErr) {
            console.warn("MongoDB unreachable. Returning evaluation stats without saving.", dbErr);
        }

        return NextResponse.json({
            success: true,
            assessmentId,
            report: {
                roadmap: roadmapString,
                skillGap: { overallScore: score, strengths, weaknesses },
                recommendations: recommendations
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Interview Evaluation error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
