import mongoose, { Document, Model } from "mongoose";

export interface IBooking extends Document {
    studentId: mongoose.Types.ObjectId;
    mentorId: mongoose.Types.ObjectId;
    serviceId: mongoose.Types.ObjectId;
    slotId: mongoose.Types.ObjectId;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "FAILED";
    paymentId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new mongoose.Schema<IBooking>(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorProfile", required: true, index: true },
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
        slotId: { type: mongoose.Schema.Types.ObjectId, ref: "AvailabilitySlot", required: true, unique: true }, // Index for duplicate prevention
        status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "FAILED"], default: "PENDING" },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", index: true }, // paymentId index
    },
    { timestamps: true }
);

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
