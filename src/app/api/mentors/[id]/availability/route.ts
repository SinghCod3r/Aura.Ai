import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { AvailabilitySlot } from "@/models";
import mongoose from "mongoose";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id: mentorId } = await params;

        const url = new URL(req.url);
        const dateParam = url.searchParams.get("date"); // Optional: YYYY-MM-DD

        // Build query
        const query: any = {
            mentorProfileId: mentorId,
            isBooked: false,
            startTime: { $gte: new Date() },
        };

        // If a specific date is requested, filter to that day
        if (dateParam) {
            const dayStart = new Date(`${dateParam}T00:00:00.000Z`);
            const dayEnd = new Date(`${dateParam}T23:59:59.999Z`);
            query.startTime = { $gte: dayStart, $lte: dayEnd };
        }

        // Only query real slots if mentorId is a valid ObjectId
        let slots: any[] = [];
        if (mongoose.Types.ObjectId.isValid(mentorId)) {
            slots = await AvailabilitySlot.find(query)
                .sort({ startTime: 1 })
                .lean();
        }

        return NextResponse.json({
            slots: slots.map((s) => ({
                id: s._id.toString(),
                startTime: s.startTime,
                endTime: s.endTime,
            })),
            hasDatabaseSlots: slots.length > 0,
        });
    } catch (error: any) {
        console.error("Availability API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch availability", details: error.message },
            { status: 500 }
        );
    }
}
