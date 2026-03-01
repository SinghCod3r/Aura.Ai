import mongoose, { Document, Model } from "mongoose";

export interface IMentorProfile extends Document {
    userId: mongoose.Types.ObjectId;
    expertise: string[];
    bio?: string;
    designation?: string;
    company?: string;
    hourlyRate: number;
    averageRating: number;
    totalReviews: number;
    isApproved: boolean; // Replaces auto-approvals
}

const MentorProfileSchema = new mongoose.Schema<IMentorProfile>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        expertise: { type: [String], default: [] },
        bio: { type: String },
        designation: { type: String },
        company: { type: String },
        hourlyRate: { type: Number, default: 50 },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        isApproved: { type: Boolean, default: false } // Default to pending approval
    }
);

export const MentorProfile: Model<IMentorProfile> =
    mongoose.models.MentorProfile || mongoose.model<IMentorProfile>("MentorProfile", MentorProfileSchema);
