import connectToDatabase from "./mongoose";
import { AnalyticsEvent } from "@/models";
import mongoose from "mongoose";

export const trackEvent = async (
    eventName: string,
    userId?: string | mongoose.Types.ObjectId,
    properties?: Record<string, unknown>
) => {
    try {
        await connectToDatabase();

        await AnalyticsEvent.create({
            eventName,
            userId: userId ? new mongoose.Types.ObjectId(userId.toString()) : undefined,
            properties,
        });

        console.log(`Analytics event tracked: ${eventName}`);
    } catch (error) {
        console.error(`Failed to track event ${eventName}:`, error);
    }
};
