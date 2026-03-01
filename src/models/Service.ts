import mongoose, { Document, Model } from "mongoose";

export interface IService extends Document {
    mentorProfileId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    durationMins: number;
    price: number;
    isActive: boolean;
}

const ServiceSchema = new mongoose.Schema<IService>(
    {
        mentorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorProfile", required: true, index: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        durationMins: { type: Number, required: true },
        price: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
    }
);

export const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
