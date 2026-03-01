import mongoose from "mongoose";

// Program
const ProgramSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
});
export const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);

// Enrollment
const EnrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
    enrolledAt: { type: Date, default: Date.now }
});
export const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);

// Feedback
const FeedbackSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorProfile", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
});
export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

// Referral
const ReferralSchema = new mongoose.Schema({
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referredEmail: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "COMPLETED"], default: "PENDING" },
    createdAt: { type: Date, default: Date.now }
});
export const Referral = mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);

// Event (generic events collection requested in prompt)
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
