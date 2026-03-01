import mongoose, { Document, Model } from "mongoose";

export interface IAnalyticsEvent extends Document {
    eventName: string;
    userId?: mongoose.Types.ObjectId;
    properties?: any;
    createdAt: Date;
}

const AnalyticsEventSchema = new mongoose.Schema<IAnalyticsEvent>(
    {
        eventName: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        properties: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const AnalyticsEvent: Model<IAnalyticsEvent> =
    mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
