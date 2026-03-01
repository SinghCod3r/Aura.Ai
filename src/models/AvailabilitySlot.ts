import mongoose, { Document, Model } from "mongoose";

export interface IAvailabilitySlot extends Document {
    mentorProfileId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
}

const AvailabilitySlotSchema = new mongoose.Schema<IAvailabilitySlot>(
    {
        mentorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorProfile", required: true, index: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        isBooked: { type: Boolean, default: false },
    }
);

export const AvailabilitySlot: Model<IAvailabilitySlot> =
    mongoose.models.AvailabilitySlot || mongoose.model<IAvailabilitySlot>("AvailabilitySlot", AvailabilitySlotSchema);
