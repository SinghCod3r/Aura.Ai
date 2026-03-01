import mongoose, { Document, Model } from "mongoose";

export interface IAssessmentResult extends Document {
    studentId: mongoose.Types.ObjectId;
    roadmap?: string;
    skillGap?: Record<string, unknown>;
    recommendations?: string[];
    answers: { questionId: string; answerValue: string }[];
    createdAt: Date;
}

const AssessmentResultSchema = new mongoose.Schema<IAssessmentResult>(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        roadmap: { type: mongoose.Schema.Types.Mixed },
        skillGap: { type: mongoose.Schema.Types.Mixed },
        recommendations: [{ type: String }],
        answers: [
            {
                questionId: { type: String, required: true },
                answerValue: { type: String, required: true },
            },
        ],
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const AssessmentResult: Model<IAssessmentResult> =
    mongoose.models.AssessmentResult || mongoose.model<IAssessmentResult>("AssessmentResult", AssessmentResultSchema);
