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

export const DUMMY_MENTORS = [
    {
        id: "dummy-1",
        name: "Dr. Aris",
        role: "Senior AI Researcher",
        company: "Google DeepMind",
        location: "London, UK",
        rating: 4.9,
        reviews: 124,
        expertise: ["Machine Learning", "Neural Networks", "Python"],
        image: "bg-blue-600",
        hourlyRate: 150,
        bio: "Specializing in large language models and reinforcement learning."
    },
    {
        id: "dummy-2",
        name: "Sarah Chen",
        role: "Product Design Lead",
        company: "Airbnb",
        location: "San Francisco, CA",
        rating: 4.8,
        reviews: 89,
        expertise: ["UX Design", "Figma", "Product Strategy"],
        image: "bg-rose-500",
        hourlyRate: 120,
        bio: "Helping mentees build world-class digital products through design thinking."
    },
    {
        id: "dummy-3",
        name: "Marcus Thorne",
        role: "Staff Software Engineer",
        company: "Netflix",
        location: "Los Angeles, CA",
        rating: 5.0,
        reviews: 215,
        expertise: ["Distributed Systems", "Java", "Cloud Architecture"],
        image: "bg-emerald-600",
        hourlyRate: 200,
        bio: "Scaling systems to millions of users. Expert in high-performance computing."
    }
];
